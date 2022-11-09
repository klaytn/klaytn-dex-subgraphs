/* eslint-disable @typescript-eslint/no-unused-vars */
import { Pool, User } from "../generated/schema";
import { Address, ethereum } from "@graphprotocol/graph-ts";
import { BI_ZERO, BI_ONE } from "./utils";

export function getOrCreateUser(address: Address, pool: Pool, block: ethereum.Block): User {
  const uid = address.toHex();
  const id = pool.id.concat("-").concat(uid);
  let user = User.load(id);

  if (user === null) {
    user = new User(id);
    user.address = address;
    user.pool = pool.id;
    user.amount = BI_ZERO;
    user.rewardDebt = BI_ZERO;
    user.harvested = BI_ZERO;
    pool.totalUsersCount = pool.totalUsersCount.plus(BI_ONE);
    pool.save();
  }

  user.updatedAtTimestamp = block.timestamp;
  user.updatedAtBlock = block.number;
  user.save();

  return user;
}