const testObject = {
  // -----------------------------
  RETURN_FULFILLED_PROMISE_ON_SYNC_RESOLVE: function (e) {
    getPromise(e, (resolve, reject) => {
      resolve("sync_resolve");
    }).then((v) => {
      match(e, diffTime(), [v + "!!"]);
    });
  },

  RETURN_FULFILLED_PROMISE_ON_SYNC_REJECT: function (e) {
    getPromise(e, (resolve, reject) => {
      reject("sync_reject");
    }).then(
      () => { },
      (v) => {
        match(e, diffTime(), [v + "!!"]);
      }
    );
  },

  QUEUE_MICRO_TASK: function (e) {
    const values = [];
    getPromise(e, (resolve, reject) => {
      resolve();
    })
      .then(() => values.push("resolve on 1st then"))
      .then(() => {
        values.push("resolve on 2st then");
        match(e, diffTime(), values);
      });
    values.push("sync");
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
      return new MyPromise((resolve, reject) => {
        queueMicrotask(() => {
          // コールバックは必ずマイクロタスクキューにつまれる
          try {
            // 呼び出し元インスタンスでconcludeされた値を用いてcallbackを実行
            const resultFromCB = callBack(this.valueOnConclude);
            resolve(resultFromCB);
          } catch (err) {
            // rejectかつ第2CBが渡ってきてない場合は、rejectedにして次のthenメソッドの第2引数を呼び出す
            reject(err);
          }
        });
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
