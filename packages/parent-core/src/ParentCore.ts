import debug from "debug";

import { Core } from "@kirby-web3/common";
import { ParentPlugin } from "./ParentPlugin";
debug.enable("kirby:*");

export class ParentCore extends Core<ParentPlugin<any>> {}
