export default class UserDto {
  constructor(address, name, email, isVerified, idPhoto, selfie) {
    this.address = address;
    this.name = name;
    this.email = email;
    this.isVerified = isVerified;
    this.idPhoto = idPhoto;
    this.selfie = selfie;
  }
}
