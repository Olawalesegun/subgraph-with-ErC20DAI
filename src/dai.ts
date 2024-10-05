import { Transfer as TransferEvent } from "../generated/Dai/Dai";
import { getUser } from "./utils";

export function handleTransfer(event: TransferEvent): void {
  let sender = getUser(event.params.src.toHexString());
  let receiver = getUser(event.params.dst.toHexString());

  let amount = event.params.wad;
  sender.balance = sender.balance.minus(amount);
  receiver.balance = receiver.balance.plus(amount);

  sender.save();
  receiver.save();
}
