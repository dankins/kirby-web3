// IFrame action types
export const CHILD_ALIVE = "ALIVE";
export const CHILD_RESPONSE = "RESPONSE";
export const CHILD_SHOW_VIEW = "SHOW_VIEW";
export const CHILD_HIDE_VIEW = "HIDE_VIEW";
export const SEND_TO_PARENT = "SEND_TO_PARENT";

export interface ChildAliveAction {
  type: typeof CHILD_ALIVE;
  payload: {
    provides: string[];
  };
}

export interface ChildResponseAction {
  type: typeof CHILD_RESPONSE;
  requestID: number;
  payload: {};
}

export interface ChildShowView {
  type: typeof CHILD_SHOW_VIEW;
  payload: {};
}

export interface ChildHideView {
  type: typeof CHILD_HIDE_VIEW;
  payload: {};
}

export interface ChildSendToParent {
  type: typeof SEND_TO_PARENT;
  payload: {
    type: string;
    payload: any;
  };
}
export type ChildToParentMessage =
  | ChildAliveAction
  | ChildResponseAction
  | ChildShowView
  | ChildHideView
  | ChildSendToParent;
