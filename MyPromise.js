class MyPromise {
  state = "pending"; // インスタンスの初期状態はpending
  valueOnConclude = null; // concluderに渡された値を格納

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
  then(onFulfilledCB, onRejectedCB) { }
  // catch ==============================
  catch(onRejectedCB) { }
}
