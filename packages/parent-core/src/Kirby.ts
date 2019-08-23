import { DMZ } from "./DMZ";
import { Core } from "@kirby-web3/common";
import { ParentPlugin } from "./ParentPlugin";

export class Kirby extends Core<ParentPlugin> {
  public defaultPlugins(): any[] {
    return [new DMZ()];
  }
}
