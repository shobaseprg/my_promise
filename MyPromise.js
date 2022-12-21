class MyPromise {
  state = "pending"; // インスタンスの初期状態はpending
  valueOnConclude = null; // concluderに渡された値を格納
  reservedFuncs = null; // thenで実行予約された関数群

  // constructor ==============================
  constructor(executor) {
    // new Promise時の引数がexecutorに渡ってくる

    // 結論をセット
    const setConclusion = (fate, valueOnConclude) => {
      this.state = fate; // 状態を変える
      this.valueOnConclude = valueOnConclude; // concludeされた値をセット
    };

    // 予約されたCBを実行
    const runReservedCB = (fate) => {
      if (!this.reservedFuncs) return;
      // fateに合わせてコールバックを実行する
      this.reservedFuncs[
        fate === "fulfilled" ? "onFulfilledCB" : "onRejectedCB"
      ](this.valueOnConclude);
    };

    // executorに渡すresolve関数
    const resolve = (resolvedValue) => {
      if (this.state !== "pending") return; // 既にconcludeされてたら何もしない
      setConclusion("fulfilled", resolvedValue);
      runReservedCB("fulfilled");
    };

    // executorに渡すreject関数
    const reject = (rejectedValue) => {
      if (this.state !== "pending") return; // 既にconcludeされてたら何もしない
      setConclusion("rejected", rejectedValue);
      runReservedCB("rejected");
    };

    // run executor
    try {
      executor(resolve, reject); // concluderを引数にとりexecutorを実行
    } catch (err) {
      reject(err);
    }
  }

  // then ==============================
  then(onFulfilledCB, onRejectedCB) {
    const createMyPromise = (callBack) => {
      return new MyPromise((resolve) => {
        const resultFromCB = callBack(this.valueOnConclude);
        resolve(resultFromCB);
      });
    };

    // executorが同期関数でconcludeされた場合は、then実行時にstateが"fulfilled"または"rejected"になっている
    // その場合は、コールバックを実行する
    if (this.state === "fulfilled") {
      return createMyPromise(onFulfilledCB);
    }
    if (this.state === "rejected") {
      return createMyPromise(onRejectedCB);
    }
    // then実行時、呼び出し元インスタンスがpendingだった場合reservedFuncsに登録しておく
    this.reservedFuncs = {
      onFulfilledCB,
      onRejectedCB,
    };
  }
  // catch ==============================
  catch(onRejectedCB) { }
}
