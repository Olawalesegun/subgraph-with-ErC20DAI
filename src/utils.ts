import { BigInt } from "@graphprotocol/graph-ts";
import { User } from "../generated/schema";

export function getUser(id: string): User {
  let user = User.load(id);
  if (user === null) {
    user = new User(id);
    user.balance = BigInt.fromI32(0);
    user.save();
  }

  return user;
}
