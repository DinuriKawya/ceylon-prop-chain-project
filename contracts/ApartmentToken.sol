// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

contract ApartmentToken {
    address public owner;
    
    struct User {
        string name;
        string email;
        string idPhoto;
        string selfie;
        bool isVerified;
        uint256 registeredAt;
    }
    
    struct Apartment {
        uint256 id;
        string title;
        string location;
        string description;
        uint256 totalTokens;
        uint256 tokenPrice;
        uint256 tokensSold;
        address owner;
        bool isVerified;
        uint256 createdAt;
        string imageUrl;
        string deedUrl;
        bool isRejected;
    }
    
    struct TokenHolder {
        address holder;
        uint256 amount;
    }
    
    mapping(address => User) public users;
    address[] public pendingUsers;
    address[] public verifiedUsers;
    
    Apartment[] public apartments;
    mapping(uint256 => mapping(address => uint256)) public userTokenBalance;
    mapping(uint256 => TokenHolder[]) public apartmentHolders;
    mapping(uint256 => uint256) public apartmentBalance;
    mapping(uint256 => mapping(address => uint256)) public claimableRentalIncome;

    event UserRegistered(address indexed user, string name);
    event UserApproved(address indexed user);
    event UserRejected(address indexed user);
    event ApartmentCreated(uint256 indexed id, string title);
    event ApartmentVerified(uint256 indexed id);
    event TokensPurchased(uint256 indexed apartmentId, address indexed buyer, uint256 amount, uint256 totalPrice);
    event TokensTransferred(uint256 indexed apartmentId, address indexed from, address indexed to, uint256 amount);
    event TokensSold(uint256 indexed apartmentId, address indexed seller, uint256 amount, uint256 totalValue);
    event FundsWithdrawn(uint256 indexed apartmentId, address indexed owner, uint256 amount);
    event ApartmentRejected(uint256 indexed id);
    event RentalIncomeDistributed(uint256 indexed apartmentId, uint256 totalAmount);
    event RentalIncomeClaimed(uint256 indexed apartmentId, address indexed holder, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can call this");
        _;
    }
    
    modifier onlyVerifiedUser() {
        require(users[msg.sender].isVerified, "You must be verified to perform this action");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        users[owner] = User("Admin", "admin@ceylonpropchain.com", "", "", true, block.timestamp);
        verifiedUsers.push(owner);
    }
    
    // ============ USER MANAGEMENT ============
    
    function registerUser(
        string memory _name,
        string memory _email,
        string memory _idPhoto,
        string memory _selfie
    ) public {
        require(bytes(users[msg.sender].name).length == 0, "User already registered");
        require(bytes(_name).length > 0, "Name is required");
        require(bytes(_email).length > 0, "Email is required");
        
        users[msg.sender] = User(_name, _email, _idPhoto, _selfie, false, block.timestamp);
        pendingUsers.push(msg.sender);
        
        emit UserRegistered(msg.sender, _name);
    }
    
    function getPendingUsers() public view onlyOwner returns (
        address[] memory,
        string[] memory,
        string[] memory,
        string[] memory,
        string[] memory
    ) {
        uint256 len = pendingUsers.length;
        address[] memory addresses = new address[](len);
        string[] memory names = new string[](len);
        string[] memory emails = new string[](len);
        string[] memory idPhotos = new string[](len);
        string[] memory selfies = new string[](len);
        
        for (uint256 i = 0; i < len; i++) {
            addresses[i] = pendingUsers[i];
            names[i] = users[pendingUsers[i]].name;
            emails[i] = users[pendingUsers[i]].email;
            idPhotos[i] = users[pendingUsers[i]].idPhoto;
            selfies[i] = users[pendingUsers[i]].selfie;
        }
        
        return (addresses, names, emails, idPhotos, selfies);
    }
    
    function approveUser(address _user) public onlyOwner {
        require(users[_user].isVerified == false, "User already verified");
        require(bytes(users[_user].name).length > 0, "User not found");
        
        users[_user].isVerified = true;
        verifiedUsers.push(_user);
        
        for (uint256 i = 0; i < pendingUsers.length; i++) {
            if (pendingUsers[i] == _user) {
                pendingUsers[i] = pendingUsers[pendingUsers.length - 1];
                pendingUsers.pop();
                break;
            }
        }
        
        emit UserApproved(_user);
    }
    
    function rejectUser(address _user) public onlyOwner {
        require(bytes(users[_user].name).length > 0, "User not found");
        
        for (uint256 i = 0; i < pendingUsers.length; i++) {
            if (pendingUsers[i] == _user) {
                pendingUsers[i] = pendingUsers[pendingUsers.length - 1];
                pendingUsers.pop();
                break;
            }
        }
        
        delete users[_user];
        emit UserRejected(_user);
    }
    
    function isUserVerified(address _user) public view returns (bool) {
        return users[_user].isVerified;
    }
    
    function getUserInfo(address _user) public view returns (
        string memory name,
        string memory email,
        bool verified,
        string memory idPhoto,
        string memory selfie
    ) {
        User storage user = users[_user];
        return (user.name, user.email, user.isVerified, user.idPhoto, user.selfie);
    }
    
    function getAllVerifiedUsers() public view returns (address[] memory) {
        return verifiedUsers;
    }
    
    function getPendingCount() public view returns (uint256) {
        return pendingUsers.length;
    }
    
    // ============ APARTMENT MANAGEMENT ============
    
    function createApartment(
        string memory _title,
        string memory _location,
        string memory _description,
        uint256 _totalTokens,
        uint256 _tokenPrice,
        string memory _imageUrl,
        string memory _deedUrl
    ) public onlyVerifiedUser {
        require(bytes(_title).length > 0, "Title required");
        require(bytes(_location).length > 0, "Location required");
        require(_totalTokens > 0, "Total tokens must be > 0");
        require(_tokenPrice > 0, "Token price must be > 0");

        apartments.push(Apartment({
            id: apartments.length,
            title: _title,
            location: _location,
            description: _description,
            totalTokens: _totalTokens,
            tokenPrice: _tokenPrice,
            tokensSold: 0,
            owner: msg.sender,
            isVerified: false,
            createdAt: block.timestamp,
            imageUrl: _imageUrl,
            deedUrl: _deedUrl,
            isRejected: false
        }));

        emit ApartmentCreated(apartments.length - 1, _title);
    }

    function verifyApartment(uint256 _apartmentId, bool _verify) public onlyOwner {
        require(_apartmentId < apartments.length, "Apartment does not exist");
        require(!apartments[_apartmentId].isRejected, "Apartment was rejected");
        apartments[_apartmentId].isVerified = _verify;
        emit ApartmentVerified(_apartmentId);
    }

    function rejectApartment(uint256 _apartmentId) public onlyOwner {
        require(_apartmentId < apartments.length, "Apartment does not exist");
        require(!apartments[_apartmentId].isVerified, "Cannot reject an already verified apartment");
        apartments[_apartmentId].isRejected = true;
        emit ApartmentRejected(_apartmentId);
    }
    
    function getAllApartments() public view returns (
        uint256[] memory ids,
        string[] memory titles,
        string[] memory locations,
        string[] memory descriptions,
        uint256[] memory totalTokens,
        uint256[] memory tokenPrices,
        uint256[] memory tokensSold,
        bool[] memory isVerified,
        string[] memory imageUrls,
        string[] memory deedUrls,
        address[] memory owners,
        bool[] memory isRejected
    ) {
        uint256 len = apartments.length;
        ids = new uint256[](len);
        titles = new string[](len);
        locations = new string[](len);
        descriptions = new string[](len);
        totalTokens = new uint256[](len);
        tokenPrices = new uint256[](len);
        tokensSold = new uint256[](len);
        isVerified = new bool[](len);
        imageUrls = new string[](len);
        deedUrls = new string[](len);
        owners = new address[](len);
        isRejected = new bool[](len);

        for (uint256 i = 0; i < len; i++) {
            ids[i] = apartments[i].id;
            titles[i] = apartments[i].title;
            locations[i] = apartments[i].location;
            descriptions[i] = apartments[i].description;
            totalTokens[i] = apartments[i].totalTokens;
            tokenPrices[i] = apartments[i].tokenPrice;
            tokensSold[i] = apartments[i].tokensSold;
            isVerified[i] = apartments[i].isVerified;
            imageUrls[i] = apartments[i].imageUrl;
            deedUrls[i] = apartments[i].deedUrl;
            owners[i] = apartments[i].owner;
            isRejected[i] = apartments[i].isRejected;
        }
    }
    
    function buyTokens(uint256 _apartmentId, uint256 _amount) public payable onlyVerifiedUser {
        require(_apartmentId < apartments.length, "Apartment does not exist");
        Apartment storage apt = apartments[_apartmentId];
        require(apt.isVerified, "Apartment not verified yet");
        require(apt.tokensSold + _amount <= apt.totalTokens, "Not enough tokens available");
        
        uint256 totalCost = apt.tokenPrice * _amount;
        require(msg.value >= totalCost, "Insufficient payment");
        
        userTokenBalance[_apartmentId][msg.sender] += _amount;
        apt.tokensSold += _amount;
        apartmentBalance[_apartmentId] += totalCost;

        bool found = false;
        for (uint256 i = 0; i < apartmentHolders[_apartmentId].length; i++) {
            if (apartmentHolders[_apartmentId][i].holder == msg.sender) {
                apartmentHolders[_apartmentId][i].amount += _amount;
                found = true;
                break;
            }
        }
        if (!found) {
            apartmentHolders[_apartmentId].push(TokenHolder(msg.sender, _amount));
        }

        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
        
        emit TokensPurchased(_apartmentId, msg.sender, _amount, totalCost);
    }
    
    function transferTokens(uint256 _apartmentId, address _to, uint256 _amount) public onlyVerifiedUser {
        require(_apartmentId < apartments.length, "Apartment does not exist");
        require(_to != address(0), "Invalid address");
        require(userTokenBalance[_apartmentId][msg.sender] >= _amount, "Insufficient tokens");
        
        userTokenBalance[_apartmentId][msg.sender] -= _amount;
        userTokenBalance[_apartmentId][_to] += _amount;
        
        for (uint256 i = 0; i < apartmentHolders[_apartmentId].length; i++) {
            if (apartmentHolders[_apartmentId][i].holder == msg.sender) {
                if (apartmentHolders[_apartmentId][i].amount == _amount) {
                    apartmentHolders[_apartmentId][i] = apartmentHolders[_apartmentId][apartmentHolders[_apartmentId].length - 1];
                    apartmentHolders[_apartmentId].pop();
                } else {
                    apartmentHolders[_apartmentId][i].amount -= _amount;
                }
                break;
            }
        }
        
        bool found = false;
        for (uint256 i = 0; i < apartmentHolders[_apartmentId].length; i++) {
            if (apartmentHolders[_apartmentId][i].holder == _to) {
                apartmentHolders[_apartmentId][i].amount += _amount;
                found = true;
                break;
            }
        }
        if (!found && _amount > 0) {
            apartmentHolders[_apartmentId].push(TokenHolder(_to, _amount));
        }
        
        emit TokensTransferred(_apartmentId, msg.sender, _to, _amount);
    }
    
    function sellTokens(uint256 _apartmentId, uint256 _amount) public onlyVerifiedUser {
        require(_apartmentId < apartments.length, "Apartment does not exist");
        require(userTokenBalance[_apartmentId][msg.sender] >= _amount, "Insufficient tokens");
        
        Apartment storage apt = apartments[_apartmentId];
        uint256 totalValue = apt.tokenPrice * _amount;
        require(apartmentBalance[_apartmentId] >= totalValue, "Insufficient apartment liquidity for this sale");

        userTokenBalance[_apartmentId][msg.sender] -= _amount;
        apt.tokensSold -= _amount;
        apartmentBalance[_apartmentId] -= totalValue;

        for (uint256 i = 0; i < apartmentHolders[_apartmentId].length; i++) {
            if (apartmentHolders[_apartmentId][i].holder == msg.sender) {
                if (apartmentHolders[_apartmentId][i].amount == _amount) {
                    apartmentHolders[_apartmentId][i] = apartmentHolders[_apartmentId][apartmentHolders[_apartmentId].length - 1];
                    apartmentHolders[_apartmentId].pop();
                } else {
                    apartmentHolders[_apartmentId][i].amount -= _amount;
                }
                break;
            }
        }
        
        payable(msg.sender).transfer(totalValue);
        emit TokensSold(_apartmentId, msg.sender, _amount, totalValue);
    }

    function withdraw(uint256 _apartmentId, uint256 _amount) public {
        require(_apartmentId < apartments.length, "Apartment does not exist");
        require(msg.sender == apartments[_apartmentId].owner, "Only the apartment owner can withdraw");
        require(_amount > 0 && _amount <= apartmentBalance[_apartmentId], "Invalid withdrawal amount");

        apartmentBalance[_apartmentId] -= _amount;
        payable(msg.sender).transfer(_amount);

        emit FundsWithdrawn(_apartmentId, msg.sender, _amount);
    }

    // Admin deposits real-world rent collected for an apartment; it's split
    // proportionally across everyone currently holding tokens in it.
    function distributeRentalIncome(uint256 _apartmentId) public payable onlyOwner {
        require(_apartmentId < apartments.length, "Apartment does not exist");
        require(apartments[_apartmentId].isVerified, "Apartment not verified");
        require(apartments[_apartmentId].tokensSold > 0, "No tokens sold yet");
        require(msg.value > 0, "Must send ETH to distribute");

        uint256 len = apartmentHolders[_apartmentId].length;
        for (uint256 i = 0; i < len; i++) {
            address holder = apartmentHolders[_apartmentId][i].holder;
            uint256 holderAmount = apartmentHolders[_apartmentId][i].amount;
            uint256 share = (msg.value * holderAmount) / apartments[_apartmentId].tokensSold;
            claimableRentalIncome[_apartmentId][holder] += share;
        }

        emit RentalIncomeDistributed(_apartmentId, msg.value);
    }

    function claimRentalIncome(uint256 _apartmentId) public {
        uint256 amount = claimableRentalIncome[_apartmentId][msg.sender];
        require(amount > 0, "No rental income to claim");

        claimableRentalIncome[_apartmentId][msg.sender] = 0;
        payable(msg.sender).transfer(amount);

        emit RentalIncomeClaimed(_apartmentId, msg.sender, amount);
    }

    function getTokenBalance(uint256 _apartmentId, address _user) public view returns (uint256) {
        return userTokenBalance[_apartmentId][_user];
    }
    
    function getTotalSupply(uint256 _apartmentId) public view returns (uint256) {
        require(_apartmentId < apartments.length, "Apartment does not exist");
        return apartments[_apartmentId].totalTokens;
    }
    
    function getTopHolders(uint256 _apartmentId, uint256 _limit) public view returns (address[] memory, uint256[] memory) {
        uint256 len = apartmentHolders[_apartmentId].length;
        uint256 limit = _limit < len ? _limit : len;
        
        TokenHolder[] memory sorted = new TokenHolder[](len);
        for (uint256 i = 0; i < len; i++) {
            sorted[i] = apartmentHolders[_apartmentId][i];
        }
        
        for (uint256 i = 0; i < len; i++) {
            for (uint256 j = i + 1; j < len; j++) {
                if (sorted[j].amount > sorted[i].amount) {
                    TokenHolder memory temp = sorted[i];
                    sorted[i] = sorted[j];
                    sorted[j] = temp;
                }
            }
        }
        
        address[] memory topAddresses = new address[](limit);
        uint256[] memory topAmounts = new uint256[](limit);
        
        for (uint256 i = 0; i < limit; i++) {
            topAddresses[i] = sorted[i].holder;
            topAmounts[i] = sorted[i].amount;
        }
        
        return (topAddresses, topAmounts);
    }
}
