// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Donation {

    struct Campaign {
        address payable organization;
        string name;
        string description;
        uint targetAmount;
        uint targetDate;
        uint raisedAmount;
        bool fundsReleased;
        string milestoneIPFSHash; // IPFS hash of the milestone document
        bool approved; // Admin approval flag
        bool closedForFunding; // Initially true, then set to false upon approval
        CampaignStatus status;
        bool isDeleted;
        mapping(address => uint) donations; // Tracks individual donor contributions
        address[] donorList;
    }
    
    enum CampaignStatus { Pending, Approved, Rejected }

    struct CampaignView {
        address payable organization;
        string name;
        string description;
        uint targetAmount;
        uint targetDate;
        uint raisedAmount;
        bool fundsReleased;
        string milestoneIPFSHash;
        bool approved;
        bool closedForFunding;
        CampaignStatus status;
        bool isDeleted;
    }

    // Each campaign is identified by a unique ID.
    mapping(uint => Campaign) public campaigns;
    uint public campaignCount;
    address public admin;

    constructor() {
        admin = msg.sender; // Admin is the deployer
    }

    modifier onlyAdmin () {
        require(msg.sender == admin, "Not Authorised");
        _;
    }
    
    // Events for logging actions
    event CampaignCreated(uint campaignId, address organization, uint targetAmount, uint targetDate);
    event CampaignUpdated(uint campaignId);
    event CampaignApproved(uint campaignId);
    event CampaignRejected(uint campaignId, string reason);
    event CampaignDeleted(uint campaignId);
    event DonationReceived(uint campaignId, address donor, uint amount);
    event MilestoneAchieved(uint campaignId);
    event FundsReleased(uint campaignId, uint amount);
    event RefundIssued(uint campaignId, address donor, uint amount);
    
    // 1. Organization creates a new campaign.
    // The organization sets the funding target and the duration fo funding (in seconds) for the campaign.
    // automatically, the created campaign is not open for funding until the admin authorizes (or rejects)
    function createCampaign(
        string memory _name,
        string memory _description,
        uint _targetAmount,
        uint _targetDate,
        string memory _milestoneIPFSHash
    ) public returns (uint) {
        campaignCount++;

        Campaign storage newCampaign = campaigns[campaignCount];
        newCampaign.organization = payable(msg.sender);
        newCampaign.name = _name;
        newCampaign.description = _description;
        newCampaign.targetAmount = _targetAmount;
        newCampaign.targetDate = _targetDate;
        newCampaign.milestoneIPFSHash = _milestoneIPFSHash;
        newCampaign.raisedAmount = 0;
        newCampaign.fundsReleased = false;
        newCampaign.approved = false;
        newCampaign.closedForFunding = true;
        newCampaign.status = CampaignStatus.Pending;
        newCampaign.isDeleted = false;

        emit CampaignCreated(campaignCount, msg.sender, _targetAmount, _targetDate);
        return campaignCount;
    }

    // 2. Update Created Campaign
    // Updates are only allowed before approval and only the creator of the campaign can update details
    function updateCampaign(
        uint _campaignId,
        string memory _name,
        string memory _description,
        uint _targetAmount,
        uint _targetDate,
        string memory _milestoneIPFSHash
    ) public { 
        Campaign storage c = campaigns[_campaignId];
        require(c.organization == msg.sender, "Cannot update campaign, not authorized");
        require(_campaignId > 0 && _campaignId <= campaignCount, "Campaign does not exist");
        require(c.approved == false, "Campaign has been approved");

        c.name = _name;
        c.description = _description;
        c.targetAmount = _targetAmount;
        c.targetDate = _targetDate;
        c.milestoneIPFSHash = _milestoneIPFSHash;

        emit CampaignUpdated(_campaignId);
    }

    // 3. Approve Campaign
    // Admin approves the campaign after reviewing details including the milestone document
    function approveCampaign(uint _campaignId) public onlyAdmin {
        Campaign storage c = campaigns[_campaignId];
        require(_campaignId > 0 && _campaignId <= campaignCount, "Campaign does not exist");
        require(c.isDeleted == false, "Cannot approve deleted campaign");
        require(!c.approved, "Campaign already approved");
        require(c.status == CampaignStatus.Pending, "Campaign already processed");

        c.approved = true;
        c.closedForFunding = false; // Now open for funding
        c.status = CampaignStatus.Approved;

        emit CampaignApproved(_campaignId);
    }

    // 4. Reject Campaign
    // Admin rejexts a campaign after reviewing the details including milestone document
    function rejectCampaign (uint _campaignId, string memory _reason) public onlyAdmin {
        Campaign storage c = campaigns[_campaignId];
        require(_campaignId > 0 && _campaignId <= campaignCount, "Campaign does not exist");
        require(!c.approved, "Campaign already approved");
        require(c.status == CampaignStatus.Pending, "Campaign already processed");
        
        c.status = CampaignStatus.Rejected;
        emit CampaignRejected(_campaignId, _reason);
    }
    
    // 5. Donors contribute to a campaign.
    // Funds are added to the campaign's raised amount and tracked per donor.
    // funds ar initially held in the contract (escrow)
    function donate(uint _campaignId) public payable {
        Campaign storage c = campaigns[_campaignId];
        require(c.approved, "Campaign is not approved");
        require(block.timestamp < c.targetDate, "Campaign deadline passed");
        require(msg.value > 0, "Donation must be greater than zero");
        require(msg.sender != c.organization, "Cannot donate to your own campaign");

        if (c.donations[msg.sender] == 0){
            c.donorList.push(msg.sender);
        }

        c.raisedAmount += msg.value;
        c.donations[msg.sender] += msg.value;

        emit DonationReceived(_campaignId, msg.sender, msg.value);
    }
    
    // 6. Release funds if the milestone is achieved.
    // Funds are transferred to the organization.
    function releaseFunds(uint _campaignId) public onlyAdmin {
        Campaign storage c = campaigns[_campaignId];
        require(c.approved, "Milestone not achieved");
        require(!c.fundsReleased, "Funds already released");
        require(block.timestamp >= c.targetDate, "Target date is not yet reached");

        c.fundsReleased = true;
        uint amount = c.raisedAmount;
        c.raisedAmount = 0; // Reset raised amount to prevent re-entrancy
        (bool sent, ) = c.organization.call{value: amount}("");
        require(sent, "Failed to send funds");

        emit FundsReleased(_campaignId, amount);
    }

    // 7. Get the donors and the corresponding amounts they donated
    // Returns all donors of a campaign and the amounts they donated respectively
    function getDonorsAndAmounts(uint _campaignId) public view returns (address[] memory, uint[] memory) {
        require(_campaignId > 0 && _campaignId <= campaignCount, "Campaign does not exist");
        Campaign storage c = campaigns[_campaignId];
        uint donorCount = c.donorList.length;
        
        address[] memory donors = new address[](donorCount);
        uint[] memory amounts = new uint[](donorCount);
        
        for (uint i = 0; i < donorCount; i++) {
            address donor = c.donorList[i];
            donors[i] = donor;
            amounts[i] = c.donations[donor];
        }  
        return (donors, amounts);
    }

    // 8. Get all the created campaigns
    // Returns all the campaigns that have been created
    function getAllCampaigns() public view returns (CampaignView[] memory) {
        // First, count the non-deleted campaigns
        uint activeCount = 0;
        for (uint i = 1; i <= campaignCount; i++) {
            if (!campaigns[i].isDeleted) {
                activeCount++;
            }
        }
        
        CampaignView[] memory activeCampaigns = new CampaignView[](activeCount);
        uint j = 0;
        for (uint i = 1; i <= campaignCount; i++) {
            if (!campaigns[i].isDeleted) {
                Campaign storage c = campaigns[i];
                activeCampaigns[j] = CampaignView({
                    organization: c.organization,
                    name: c.name,
                    description: c.description,
                    targetAmount: c.targetAmount,
                    targetDate: c.targetDate,
                    raisedAmount: c.raisedAmount,
                    fundsReleased: c.fundsReleased,
                    approved: c.approved,
                    milestoneIPFSHash: c.milestoneIPFSHash,
                    status: c.status,
                    closedForFunding: c.closedForFunding,
                    isDeleted: c.isDeleted
                });
                j++;
            }
        }
        return activeCampaigns;
    }

    // 9. Get all the rejected campaigns
    // Returns all the campaigns that were rejected by the admin for some reason
    function getAllRejectedCampaigns() public view returns (CampaignView[] memory) {
        uint rejectedCount = 0;
        // First, count the rejected campaigns
        for (uint i = 1; i <= campaignCount; i++) {
            if (campaigns[i].status == CampaignStatus.Rejected) {
                rejectedCount++;
            }
        }
        
        // Create an array with the size of the rejected campaigns count
        CampaignView[] memory rejectedCampaigns = new CampaignView[](rejectedCount);
        uint j = 0;
        // Loop again and add the rejected campaigns to the array
        for (uint i = 1; i <= campaignCount; i++) {
            if (campaigns[i].status == CampaignStatus.Rejected) {
                Campaign storage c = campaigns[i];
                rejectedCampaigns[j] = CampaignView({
                    organization: c.organization,
                    name: c.name,
                    description: c.description,
                    targetAmount: c.targetAmount,
                    targetDate: c.targetDate,
                    raisedAmount: c.raisedAmount,
                    fundsReleased: c.fundsReleased,
                    milestoneIPFSHash: c.milestoneIPFSHash,
                    approved: c.approved,
                    status: c.status,
                    closedForFunding: c.closedForFunding,
                    isDeleted: c.isDeleted
                });
                j++;
            }
        }
        return rejectedCampaigns;
    }

    // 10. Delete a created campaign
    function deleteCampaign(uint _campaignId) public {
        Campaign storage c = campaigns[_campaignId];
        require(_campaignId > 0 && _campaignId <= campaignCount, "Campaign does not exist");
        require(c.organization == msg.sender || admin == msg.sender , "Cannot delete campaign, not authorized");

        // delete campaigns[_campaignId]; // Hard Deletion 
        c.isDeleted = true; // Soft Deletion
        emit CampaignDeleted(_campaignId);
    }

    receive() external payable {}

}
