import { ChildPlugin } from "./ChildPlugin";
import { PARENT_MESSAGE } from "./ParentHandler";
import { PARENT_OUTSIDE_CLICK } from "@kirby-web3/common";
import { MiddlewareAPI, Action, Dispatch } from "redux";

export const REQUEST_VIEW_ACTION = "REQUEST_VIEW_ACTION";
export const COMPLETE_VIEW_ACTION = "COMPLETE_VIEW_ACTION";

export interface RequestViewAction {
  type: typeof REQUEST_VIEW_ACTION;
  payload: {
    route: string;
    requestID: string;
    dispatchOnComplete?: any;
  };
}

export interface CompleteViewAction {
  type: typeof COMPLETE_VIEW_ACTION;
  payload: {
    route: string;
    requestID: string;
    dispatchOnComplete?: any;
  };
}

export type ViewPluginActions = RequestViewAction;

export interface ViewState {
  queue: any[];
}

export class ViewPlugin extends ChildPlugin<any, ViewPluginActions> {
  public name = "view";
  private outsideClickHandler?: () => void;

  public middleware = (api: MiddlewareAPI<any>) => (next: Dispatch<any>) => <A extends Action>(action: any): void => {
    if (action.type === PARENT_MESSAGE && action.payload.type === PARENT_OUTSIDE_CLICK) {
      this.handleOutsideClick();
    }
    next(action);
  };

  public reducer(state: any = { queue: [] }, action: any): ViewState {
    switch (action.type) {
      case REQUEST_VIEW_ACTION:
        return { ...state, queue: state.queue.concat(action.payload) };
      case COMPLETE_VIEW_ACTION:
        const nextQueue = [...state.queue.slice(0, 0), ...state.queue.slice(0 + 1)];
        return { ...state, queue: nextQueue };
    }

    return state;
  }

  public requestView(route: string, requestID?: string, dispatchOnComplete?: any): void {
    this.dispatch({ type: REQUEST_VIEW_ACTION, payload: { route, requestID, dispatchOnComplete } });
  }

  public completeView(): void {
    this.dispatch({ type: COMPLETE_VIEW_ACTION });
  }

  public onParentClick(cb: () => void): void {
    this.outsideClickHandler = cb;
  }

  public cleanupView(): void {
    this.outsideClickHandler = undefined;
  }

  private handleOutsideClick(): void {
    if (this.outsideClickHandler) {
      this.outsideClickHandler();
    }
  }
}
