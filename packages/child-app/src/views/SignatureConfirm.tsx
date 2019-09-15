import * as React from "react";
import { CoreContext, useSelector } from "@kirby-web3/child-react";
import { SignatureInterceptorPlugin } from "@kirby-web3/plugin-ethereum";
import { RouteComponentProps } from "@reach/router";

export const SignatureConfirm: React.FunctionComponent<RouteComponentProps> = () => {
  const ctx = React.useContext(CoreContext);
  const sig = ctx.core.plugins.signatureInterceptor as SignatureInterceptorPlugin;

  const plaintext = useSelector((state: any) => {
    if (state.signatureInterceptor.requests && state.signatureInterceptor.requests[0]) {
      return state.signatureInterceptor.requests[0].plaintext;
    }
  });

  return (
    <div>
      <small>signature requested:</small>
      <div>{plaintext}</div>
      <div>
        <button onClick={() => sig.approveAction()}>approve</button>
        <button onClick={() => sig.rejectAction()}>reject</button>
      </div>
    </div>
  );
};
