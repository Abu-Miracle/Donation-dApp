// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Donation {

    struct Campaign {
        uint id;
        address payable organization;
        string name;
        string description;
        uint targetAmount;
        uint targetDate;
        uint raisedAmount;
        bool fundsReleased;
        string milestoneIPFSHash; // IPFS hash of the milestone document
        string imageUrl;
        bool approved; // Admin approval flag
        bool closedForFunding; // Initially true, then set to false upon approval
        CampaignStatus status;
        bool isDeleted;
        mapping(address => uint) donations; // Tracks individual donor contributions
        address[] donorList;
    }
    
    enum CampaignStatus { Pending, Approved, Rejected }

    struct CampaignView {
        uint id;
        address payable organization;
        string name;
        string description;
        uint targetAmount;
        uint targetDate;
        uint raisedAmount;
        string imageUrl;
        bool fundsReleased;
        string milestoneIPFSHash;
        bool approved;
        bool closedForFunding;
        CampaignStatus status;
        bool isDeleted;
    }

    // Each campaign is identified by a unique ID.
    mapping(uint => Campaign) public campaigns;
    mapping(address => uint[]) public donationTo;
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
    // The organization sets the funding target and the duration fo funding for the campaign.
    // automatically, the created campaign is not open for funding until the admin authorizes (or rejects)
    function createCampaign(
        string memory _name,
        string memory _description,
        uint _targetAmount,
        uint _targetDate,
        string memory _milestoneIPFSHash,
        string memory _imageUrl
    ) public returns (uint) {
        campaignCount++;

        Campaign storage newCampaign = campaigns[campaignCount];
        newCampaign.organization = payable(msg.sender);
        newCampaign.id = campaignCount;
        newCampaign.name = _name;
        newCampaign.description = _description;
        newCampaign.targetAmount = _targetAmount;
        newCampaign.targetDate = _targetDate;
        newCampaign.milestoneIPFSHash = _milestoneIPFSHash;
        newCampaign.imageUrl = _imageUrl;
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
        string memory _milestoneIPFSHash,
        string memory _imageUrl
    ) public { 
        Campaign storage campaignStorage = campaigns[_campaignId];
        require(campaignStorage.organization == msg.sender, "Cannot update campaign, not authorized");
        require(_campaignId > 0 && _campaignId <= campaignCount, "Campaign does not exist");
        require(campaignStorage.approved == false, "Campaign has been approved");

        campaignStorage.name = _name;
        campaignStorage.description = _description;
        campaignStorage.targetAmount = _targetAmount;
        campaignStorage.targetDate = _targetDate;
        campaignStorage.milestoneIPFSHash = _milestoneIPFSHash;
        campaignStorage.imageUrl = _imageUrl;

        emit CampaignUpdated(_campaignId);
    }

    // 3. Approve Campaign
    // Admin approves the campaign after reviewing details including the milestone document
    function approveCampaign(uint _campaignId) public onlyAdmin {
        Campaign storage campaignStorage = campaigns[_campaignId];
        require(_campaignId > 0 && _campaignId <= campaignCount, "Campaign does not exist");
        require(campaignStorage.isDeleted == false, "Cannot approve deleted campaign");
        require(!campaignStorage.approved, "Campaign already approved");
        require(campaignStorage.status == CampaignStatus.Pending, "Campaign already processed");

        campaignStorage.approved = true;
        campaignStorage.closedForFunding = false; // Now open for funding
        campaignStorage.status = CampaignStatus.Approved;

        emit CampaignApproved(_campaignId);
    }

    // 4. Reject Campaign
    // Admin rejexts a campaign after reviewing the details including milestone document
    function rejectCampaign (uint _campaignId, string memory _reason) public onlyAdmin {
        Campaign storage campaignStorage = campaigns[_campaignId];
        require(_campaignId > 0 && _campaignId <= campaignCount, "Campaign does not exist");
        require(!campaignStorage.approved, "Campaign already approved");
        require(campaignStorage.status == CampaignStatus.Pending, "Campaign already processed");
        
        campaignStorage.status = CampaignStatus.Rejected;
        emit CampaignRejected(_campaignId, _reason);
    }
    
    // 5. Donors contribute to a campaign.
    // Funds are added to the campaign's raised amount and tracked per donor.
    // funds are initially held in the contract (escrow)
    function donate(uint _campaignId) public payable {
        Campaign storage campaignStorage = campaigns[_campaignId];
        require(campaignStorage.approved, "Campaign is not approved");
        require(block.timestamp < campaignStorage.targetDate, "Campaign deadline passed");
        require(msg.value > 0, "Donation must be greater than zero");
        require(msg.sender != campaignStorage.organization, "Cannot donate to your own campaign");

        if (campaignStorage.donations[msg.sender] == 0){
            campaignStorage.donorList.push(msg.sender);

            // First time donating to this campaign, add campaign ID to donor history
            donationTo[msg.sender].push(_campaignId);
        }

        campaignStorage.raisedAmount += msg.value;
        campaignStorage.donations[msg.sender] += msg.value; 

        emit DonationReceived(_campaignId, msg.sender, msg.value);
    }

    // 6. Get Donated Canpaigns
    // Returns all the campaigns that a donor donates to
    function getDoantedCampaigns(address donor) public view returns(CampaignView[] memory donatedCampaigns) {
        uint[] memory donatedIds = donationTo[donor];
        uint len = donatedIds.length;
        donatedCampaigns = new CampaignView[](len);

        for(uint j = 0; j < len; j++){
            uint campaignId = donatedIds[j];
            Campaign storage campaignStorage = campaigns[campaignId];
            donatedCampaigns[j] = CampaignView({
                id: campaignStorage.id,
                organization: campaignStorage.organization,
                name: campaignStorage.name,
                description: campaignStorage.description,
                targetAmount: campaignStorage.targetAmount,
                targetDate: campaignStorage.targetDate,
                imageUrl: campaignStorage.imageUrl,
                raisedAmount: campaignStorage.raisedAmount,
                fundsReleased: campaignStorage.fundsReleased,
                approved: campaignStorage.approved,
                milestoneIPFSHash: campaignStorage.milestoneIPFSHash,
                status: campaignStorage.status,
                closedForFunding: campaignStorage.closedForFunding,
                isDeleted: campaignStorage.isDeleted
            });
        }
        return donatedCampaigns;
    }
    
    // 7. Release funds if the milestone is achieved.
    // Funds are transferred to the organization.
    function releaseFunds(uint _campaignId) public onlyAdmin {
        Campaign storage campaignStorage = campaigns[_campaignId];
        require(campaignStorage.approved, "Milestone not achieved");
        require(!campaignStorage.fundsReleased, "Funds already released");
        require(block.timestamp >= campaignStorage.targetDate, "Target date is not yet reached");

        campaignStorage.fundsReleased = true;
        uint amount = campaignStorage.raisedAmount;
        campaignStorage.raisedAmount = 0; // Reset raised amount to prevent re-entrancy
        (bool sent, ) = campaignStorage.organization.call{value: amount}("");
        require(sent, "Failed to send funds");

        emit FundsReleased(_campaignId, amount);
    }

    // 8. Get the donors and the corresponding amounts they donated
    // Returns all donors of a campaign and the amounts they donated respectively
    function getDonorsAndAmounts(uint _campaignId) public view returns (address[] memory, uint[] memory) {
        require(_campaignId > 0 && _campaignId <= campaignCount, "Campaign does not exist");
        Campaign storage campaignStorage = campaigns[_campaignId];
        uint donorCount = campaignStorage.donorList.length;
        
        address[] memory donors = new address[](donorCount);
        uint[] memory amounts = new uint[](donorCount);
        
        for (uint i = 0; i < donorCount; i++) {
            address donor = campaignStorage.donorList[i];
            donors[i] = donor;
            amounts[i] = campaignStorage.donations[donor];
        }  
        return (donors, amounts);
    }

    // 9. Get all the created campaigns
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
                Campaign storage campaignStorage = campaigns[i];
                activeCampaigns[j] = CampaignView({
                    id: campaignStorage.id,
                    organization: campaignStorage.organization,
                    name: campaignStorage.name,
                    description: campaignStorage.description,
                    targetAmount: campaignStorage.targetAmount,
                    targetDate: campaignStorage.targetDate,
                    imageUrl: campaignStorage.imageUrl,
                    raisedAmount: campaignStorage.raisedAmount,
                    fundsReleased: campaignStorage.fundsReleased,
                    approved: campaignStorage.approved,
                    milestoneIPFSHash: campaignStorage.milestoneIPFSHash,
                    status: campaignStorage.status,
                    closedForFunding: campaignStorage.closedForFunding,
                    isDeleted: campaignStorage.isDeleted
                });
                j++;
            }
        }
        return activeCampaigns;
    }

    // 10. Get all the rejected campaigns
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
                Campaign storage campaignStorage = campaigns[i];
                rejectedCampaigns[j] = CampaignView({
                    id: campaignStorage.id,
                    organization: campaignStorage.organization,
                    name: campaignStorage.name,
                    description: campaignStorage.description,
                    targetAmount: campaignStorage.targetAmount,
                    targetDate: campaignStorage.targetDate,
                    imageUrl: campaignStorage.imageUrl,
                    raisedAmount: campaignStorage.raisedAmount,
                    fundsReleased: campaignStorage.fundsReleased,
                    milestoneIPFSHash: campaignStorage.milestoneIPFSHash,
                    approved: campaignStorage.approved,
                    status: campaignStorage.status,
                    closedForFunding: campaignStorage.closedForFunding,
                    isDeleted: campaignStorage.isDeleted
                });
                j++;
            }
        }
        return rejectedCampaigns;
    }

    // 11. Delete a created campaign
    function deleteCampaign(uint _campaignId) public {
        Campaign storage campaignStorage = campaigns[_campaignId];
        require(_campaignId > 0 && _campaignId <= campaignCount, "Campaign does not exist");
        require(campaignStorage.organization == msg.sender || admin == msg.sender , "Cannot delete campaign, not authorized");

        // delete campaigns[_campaignId]; // Hard Deletion 
        campaignStorage.isDeleted = true; // Soft Deletion
        emit CampaignDeleted(_campaignId);
    }

    // 12. Check Amount
    // check the amount that is donated to a particular campaign by a donor 
    function checkAmount(uint _campaignId, address donor) public view returns (uint) {
        Campaign storage campaignStorage = campaigns[_campaignId];
        return campaignStorage.donations[donor];
    }

    receive() external payable {}

}
