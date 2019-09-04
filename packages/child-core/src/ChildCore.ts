import { Core } from "@kirby-web3/common";

import { ParentHandler } from "./ParentHandler";
import { ChildPlugin } from "./ChildPlugin";
import { ViewPlugin } from "./ViewPlugin";

export class ChildCore extends Core<ChildPlugin> {
  public defaultPlugins(): ChildPlugin[] {
    return [new ParentHandler(), new ViewPlugin()];
  }
}
