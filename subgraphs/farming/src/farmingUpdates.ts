import { BigInt, dataSource, ethereum } from "@graphprotocol/graph-ts";
import { Farming } from "../generated/schema";
import { BI_ZERO } from "./utils";

export function getOrCreateFarming(block: ethereum.Block): Farming {
  let farming = Farming.load(dataSource.address().toHex());

  if (farming === null) {
    farming = new Farming(dataSource.address().toHex());
    farming.totalAllocPoint = BI_ZERO;
    farming.rewardRate = BI_ZERO;//replace with initial reward rate
    farming.poolCount = BI_ZERO;
  }

  farming.timestamp = block.timestamp;
  farming.block = block.number;
  farming.save();

  return farming as Farming;
}