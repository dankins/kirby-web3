import { Plugin } from "@kirby-web3/common";
import { AnyAction } from "redux";
export abstract class ParentPlugin<C = undefined, D = any, A extends AnyAction = any> extends Plugin<C, D, A> {}
