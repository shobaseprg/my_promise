const testObject = {
  // -----------------------------
  CONCLUDE_RESOLVE: function (e) {
    const p = getPromise(e, (resolve, reject) => {
      resolve("test_resolve");
    });
    p.then((v) => {
      match(e, diffTime(), [v]);
    });
  },

  CONCLUDE_REJECT: function (e) {
    const p = getPromise(e, (resolve, reject) => {
      reject("test_reject");
    });
    p.then(
      () => {
        console.error("not log");
      },
      (err) => {
        match(e, diffTime(), [err]);
      }
    );
  },

  NO_EFFECT_AFTER_CONCLUDED: function (e) {
    const p = getPromise(e, (resolve, reject) => {
      resolve("test_resolve");
      reject("test_reject");
    });
    p.then(
      (v) => {
        match(e, diffTime(), [v]);
      },
      () => {
        console.error("not log");
      }
    );
  },
  RUN_CALLBACK_ON_SYNC_EXECUTOR: function (e) {
    getPromise(e, (resolve, reject) => {
      resolve();
    }).then((v) => {
      match(e, diffTime(), [v]);
    });
  },
};

//================================================================================================

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
  then(onFulfilledCB, onRejectedCB) {
    // executorが同期関数でconcludeされた場合は、then実行時にstateが"fulfilled"または"rejected"になっている
    // その場合は、コールバックを実行する
    if (this.state === "fulfilled") {
      onFulfilledCB(this.valueOnConclude);
    }
    if (this.state === "rejected") {
      onRejectedCB(this.valueOnConclude);
    }
  }
  // catch ==============================
  catch(onRejectedCB) { }
}
