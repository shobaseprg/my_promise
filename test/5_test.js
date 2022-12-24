const testObject = {
  RUN_CALLBACK_ON_SYNC_EXECUTOR: function (e) {
    getPromise(e, (resolve, reject) => {
      resolve();
    }).then(() => {
      match(e, diffTime(), ["resolved!!"]);
    });
  },
};

//================================================================================================

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

    // executorに渡すresolve関数
    const resolve = (resolvedValue) => {
      if (this.state !== "pending") return; // 既にconcludeされてたら何もしない
      setConclusion("fulfilled", resolvedValue);
    };

    // executorに渡すreject関数
    const reject = (rejectedValue) => {
      if (this.state !== "pending") return; // 既にconcludeされてたら何もしない
      setConclusion("rejected", rejectedValue);
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
    // executorが同期関数でconcludeされた場合は、then実行時にstateが"fulfilled"または"rejected"になっている
    // その場合は、コールバックを実行する
    if (this.state === "fulfilled") {
      onFulfilledCB(this.valueOnConclude);
    }
    if (this.state === "rejected") {
      onRejectedCB(this.valueOnConclude);
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
