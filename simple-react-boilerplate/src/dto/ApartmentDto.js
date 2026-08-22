export default class ApartmentDto {
  constructor(id, title, location, description, totalTokens, tokenPrice, tokensSold, isVerified, availableTokens, owner, imageUrl, deedUrl, isRejected, rejectionReason) {
    this.id = id;
    this.title = title;
    this.location = location;
    this.description = description;
    this.totalTokens = totalTokens;
    this.tokenPrice = tokenPrice;
    this.tokensSold = tokensSold;
    this.isVerified = isVerified;
    this.availableTokens = availableTokens;
    this.owner = owner;
    this.imageUrl = imageUrl;
    this.deedUrl = deedUrl;
    this.isRejected = isRejected;
    this.rejectionReason = rejectionReason || '';
  }
}
