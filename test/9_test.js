const testObject = {
  THEN_FUNC: function (e) {
    getPromise(e, (resolve, reject) => {
      setTimeout(() => {
        resolve("vvv");
      }, 1000);
    })
      .then((v) => {
        return v + "!!!";
      })
      .then((v) => {
        match(e, diffTime(), [v]);
      });
  }
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
      try {
        // fateに合わせてコールバックを実行する
        const resultFromCB = this.reservedFuncs[
          fate === "fulfilled" ? "onFulfilledCB" : "onRejectedCB"
        ](this.valueOnConclude);

        // thenにより作成されたインスタンスのresolve(CBの結果を渡す)を実行する
        this.reservedFuncs.resolveOfCreatedPromiseByThen(resultFromCB);
      } catch (err) {
        // CBの結果で、thenにより作成されたインスタンスのrejectを実行する
        this.reservedFuncs.rejectOfCreatedPromiseByThen(err);
      }
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
            // CBの返り値がMyPromiseインスタンスの場合
            if (resultFromCB instanceof MyPromise) {
              // そのMyPromiseインスタンスのthenにconcluderを預けて、conclude後実行してもらう
              resultFromCB.then(
                (v) => resolve(v),
                (e) => reject(e)
              );
            } else {
              // CBの結果でresolveします(rejectであっても第2引数が正しく実行されたら返すインスタンスはresolved)
              resolve(resultFromCB);
            }
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
    if (this.state === "pending") {
      return new MyPromise((resolve, reject) => {
        this.reservedFuncs = {
          onFulfilledCB, // thenの第1引数
          onRejectedCB, // thenの第2引数
          resolveOfCreatedPromiseByThen: resolve, // new されたインスタンス内で定義されているresolve
          rejectOfCreatedPromiseByThen: reject, // new されたインスタンス内で定義されているreject
        };
      });
    }
  }
  // catch ==============================
  catch(onRejectedCB) { }
}
