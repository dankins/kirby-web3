import { DMZ } from "./DMZ";
import { Core } from "@kirby-web3/common";
import { ParentPlugin } from "./ParentPlugin";

export class Kirby extends Core<ParentPlugin<any>> {
  public constructor(plugins: ParentPlugin<any>[]) {
    super(new DMZ(), plugins);
  }
}
