import ResponseDto from "../response.dto";

export default interface SignInRequestDto extends ResponseDto {
  token: string;
  expirationTime: number;
}