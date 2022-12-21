class MyPromise {
  state = "pending"; // インスタンスの初期状態はpending

  // constructor ==============================
  constructor(executor) {
    // new Promise時の引数がexecutorに渡ってくる

    // executorに渡すresolve関数
    const resolve = () => { };

    // executorに渡すreject関数
    const reject = () => { };

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
