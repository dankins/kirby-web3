import { Core } from "@kirby-web3/common";

import debug from "debug";
import { ParentHandler } from "./ParentHandler";
import { ChildPlugin } from "./ChildPlugin";
import { ViewPlugin } from "./ViewPlugin";
debug.enable("kirby:*");

export class ChildCore extends Core<ChildPlugin<any, any, any>> {
  public defaultPlugins() {
    return [new ParentHandler(), new ViewPlugin()];
  }
}
