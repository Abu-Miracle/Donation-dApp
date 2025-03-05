// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Donation {

    struct Campaign {
        address organization;
        string name;
        string description;
        uint targetAmount;
        uint targetDate;
        uint raisedAmount;
        bool fundsReleased;
        string milestoneIPFSHash; // IPFS hash of the milestone document
        bool approved; // Admin approval flag
        bool closedForFunding; // Initially true, then set to false upon approval
        mapping(address => uint) donations; // Tracks individual donor contributions
        address[] donorList;
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
        newCampaign.organization = msg.sender;
        newCampaign.name = _name;
        newCampaign.description = _description;
        newCampaign.targetAmount = _targetAmount;
        newCampaign.targetDate = _targetDate;
        newCampaign.milestoneIPFSHash = _milestoneIPFSHash;
        newCampaign.raisedAmount = 0;
        newCampaign.fundsReleased = false;
        newCampaign.approved = false;
        newCampaign.closedForFunding = true;

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
        require(!c.approved, "Campaign already approved");

        c.approved = true;
        c.closedForFunding = false; // Now open for funding

        emit CampaignApproved(_campaignId);
    }
    
    // 4. Donors contribute to a campaign.
    // Funds are added to the campaign's raised amount and tracked per donor.
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
    
    // 5. Release funds if the milestone is achieved.
    // Funds are transferred to the organization.
    function releaseFunds(uint _campaignId) public onlyAdmin {
        Campaign storage c = campaigns[_campaignId];
        require(c.approved, "Milestone not achieved");
        require(!c.fundsReleased, "Funds already released");

        c.fundsReleased = true;
        uint amount = c.raisedAmount;
        c.raisedAmount = 0; // Reset raised amount to prevent re-entrancy
        (bool sent, ) = c.organization.call{value: amount}("");
        require(sent, "Failed to send funds");

        emit FundsReleased(_campaignId, amount);
    }

    // 6. Get the donors of a campaign and the amounts they donated respectively
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

}
