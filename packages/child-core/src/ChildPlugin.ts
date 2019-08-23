import { Plugin } from "@kirby-web3/common";
import { AnyAction } from "redux";

export abstract class ChildPlugin<C = any, D = any, A extends AnyAction = any> extends Plugin<C, D, A> {}
