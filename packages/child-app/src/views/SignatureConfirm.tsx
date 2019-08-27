import * as React from "react";
import { CoreContext, useSelector } from "@kirby-web3/child-react";
import { SignatureInterceptorPlugin } from "@kirby-web3/plugin-ethereum";
import { RouteComponentProps } from "@reach/router";

export const SignatureConfirm: React.FunctionComponent<RouteComponentProps> = () => {
  const ctx = React.useContext(CoreContext);
  const sig = ctx.core.plugins.signatureInterceptor as SignatureInterceptorPlugin;

  const kirbyData = useSelector((state: any) => {
    return sig.getSignatureRequest();
  });

  function approveAction(): void {
    sig.approveAction();
  }
  function rejectAction(): void {
    sig.rejectAction();
  }
  return (
    <div>
      <small>signature requested:</small>
      <div>{kirbyData && kirbyData.plaintext}</div>
      <div>
        <button onClick={approveAction}>approve</button>
        <button onClick={rejectAction}>reject</button>
      </div>
    </div>
  );
};
