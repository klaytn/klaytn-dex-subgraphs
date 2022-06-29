import { Address } from "@graphprotocol/graph-ts";
import { User } from "../../generated/schema";
import { ZERO_BI } from "./index"

export function getOrCreateUser(poolAddress: Address, address: Address): User {
  const id = poolAddress.toHex() + "-" + address.toHex();

  let user = User.load(id);

  if (user === null) {
    user = new User(id);
    user.address = address;
    user.pool = poolAddress.toHex();
    user.amount = ZERO_BI;
    user.harvested = ZERO_BI;
    user.rewardDebt = ZERO_BI;
    user.save();
  }

  return user as User;
}