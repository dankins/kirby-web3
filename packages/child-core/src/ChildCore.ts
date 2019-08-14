import { Core } from "@kirby-web3/common";

import debug from "debug";
import { ParentHandler } from "./plugins/ParentHandler";
import { ChildPlugin } from "./ChildPlugin";
debug.enable("kirby:*");

export class ChildCore extends Core<ChildPlugin<any>> {
  constructor(plugins: ChildPlugin<any>[]) {
    super(new ParentHandler(), plugins);
  }
}
