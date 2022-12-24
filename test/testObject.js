const testObject = {
  // 3
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
    }).then(() => {
      match(e, diffTime(), ["resolved!!"]);
    });
  },

  RUN_CALLBACK_ON_RESOLVE_IN_PENDING: function (e) {
    getPromise(e, (resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    }).then(() => {
      match(e, diffTime(), ["RUN_CALLBACK_ON_RESOLVE_IN_PENDING"]);
    });
  },

  RUN_CALLBACK_ON_REJECT_IN_PENDING: function (e) {
    getPromise(e, (resolve, reject) => {
      setTimeout(() => {
        reject();
      }, 1000);
    }).then(
      () => {
        console.error("not log");
      },
      () => {
        match(e, diffTime(), ["RUN_CALLBACK_ON_RESOLVE_IN_PENDING"]);
      }
    );
  },

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

  DEPOSIT_CONCLUDER: function (e) {
    getPromise(e, (resolve, reject) => {
      resolve("v");
    })
      .then((v) => {
        return getPromise(e, (resolve, reject) => {
          resolve(v + "!");
        });
      })
      .then((v) => {
        match(e, diffTime(), [v + "!"]);
      });
  },

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
  },

  TEST_CB_IS_MYPROMISE: function (e) {
    getPromise(e, (resolve, reject) => {
      setTimeout(() => {
        resolve("aaa");
      });
    })
      .then((v) => {
        return getPromise(e, (resolve, reject) => {
          setTimeout(() => {
            resolve(v + "!!!");
          }, 1000);
        });
      })
      .then((v) => {
        match(e, diffTime(), [v]);
      });
  },

  PARALLEL_THEN: function (e) {
    const values = [];
    parallel = getPromise(e, (resolve, reject) => {
      setTimeout(() => {
        resolve("aaa");
      }, 1000);
    });

    parallel.then((v) => {
      values.push(v + "1st then");
    });

    parallel.then((v) => {
      values.push(v + "2st then");
    });

    parallel.then(() => {
      match(e, diffTime(), values);
    });
  },

  CONVERT_FUNC: function (e) {
    getPromise(e, (resolve, reject) => {
      resolve("a");
    })
      .then("not func")
      .then((v) => {
        match(e, diffTime(), [v]);
      });
  },

  CATCH: function (e) {
    getPromise(e, (resolve, reject) => {
      setTimeout(() => {
        reject("rejected");
      }, 1000);
    })
      .then((v) => {
        return v;
      })
      .catch((err) => {
        match(e, diffTime(), [err]);
      });
  },

  PEND_FOUR_SECOND_AND_CHAIN_VALUE: function (e) {
    getPromise(e, (resolve, reject) => {
      setTimeout(() => {
        resolve("h");
      }, 1000); //非同期
    })
      .then((v) => {
        return getPromise(e, (resolve) => {
          setTimeout(() => {
            resolve(v + "ello");
          }, 3000); //非同期
        });
      })
      .then(
        (v) => v,
        (e) => {
          console.error("not log");
        }
      )
      .then(
        (v) => {
          match(e, diffTime(), [v]);
        },
        (e) => {
          console.error("not log");
        }
      );
  },

  SYNC_REJECT_AND_NEXT_RESOLVE: function (e) {
    getPromise(e, (resolve, reject) => {
      reject("reject");
    })
      .then(
        (v) => {
          console.error("not log");
        },
        (err) => err
      )
      .then(
        (v) => {
          match(e, diffTime(), [v]);
        },
        () => {
          console.error("not log");
        }
      );
  },

  SYNC_REJECT_AND_NEXT_THEN_SKIP: function (e) {
    getPromise(e, (resolve, reject) => {
      reject("reject");
    })
      .then((v) => {
        console.error("not log");
      })
      .then(
        (v) => {
          console.error("not log");
        },
        (err) => {
          match(e, diffTime(), [err]);
        }
      );
  },

  ASYNC_REJECT_AND_NEXT_RESOLVE: function (e) {
    const values = [];

    getPromise(e, (resolve, reject) => {
      setTimeout(() => {
        reject("reject");
      }, 1000);
    })
      .then((v) => {
        console.error("not log");
      })
      .then(
        (v) => {
          console.error("not log");
        },
        (err) => {
          values.push(err);
        }
      )
      .then(
        (v) => {
          values.push(v);
        },
        () => {
          console.error("not log");
        }
      )
      .then(
        () => {
          z();
        },
        () => {
          console.error("not log");
        }
      )
      .then(
        (v) => {
          console.error("not log");
        },
        (err) => {
          values.push(err.message);
        }
      )
      .then(
        () => {
          x();
        },
        () => {
          console.error("not log");
        }
      )
      .catch((err) => {
        values.push(err.message);
        match(e, diffTime(), values);
      });
  },

  MIX_ASYNC_SYNC: function (e) {
    getPromise(e, (resolve, reject) => {
      resolve("h");
    })
      .then((v) => {
        return getPromise(e, (resolve) => {
          setTimeout(() => {
            resolve(v + "e");
          }, 1000); //非同期
        });
      })
      .then((v) => {
        return getPromise(e, (resolve) => {
          //同期
          resolve(v + "l");
        });
      })
      .then((v) => {
        return getPromise(e, (resolve) => {
          setTimeout(() => {
            resolve(v + "lo");
          }, 2000); //非同期
        });
      })
      .then(
        (v) => v,
        (err) => {
          console.error("not log");
        }
      )
      .then(
        (v) => {
          match(e, diffTime(), [v]);
        },
        (err) => {
          console.error("not log");
        }
      );
  },

  STATIC_RESOLVE: function (e) {
    (e ? Promise : MyPromise).resolve("reserved!!").then(
      (v) => {
        match(e, diffTime(), [v]);
      },
      (e) => {
        console.log(e);
      }
    );
  },

  STATIC_REJECT: function (e) {
    (e ? Promise : MyPromise).reject("rejected!!").then(
      (v) => {
        () => { };
      },
      (err) => {
        match(e, diffTime(), [err]);
      }
    );
  },

  STATIC_RACE: function (e) {
    const a = getPromise(e, (resolve, reject) => {
      setTimeout(() => {
        resolve("a");
      }, 2000);
    });

    const b = getPromise(e, (resolve, reject) => {
      setTimeout(() => {
        resolve("b");
      }, 5000);
    });

    const c = getPromise(e, (resolve, reject) => {
      setTimeout(() => {
        resolve("c");
      }, 1000);
    });

    (e ? Promise : MyPromise).race([a, b, c]).then(
      (v) => {
        match(e, diffTime(), [v]);
      },
      (e) => {
        console.error(e);
      }
    );
  },

  STATIC_ALL: function (e) {
    const alla = getPromise(e, (resolve, reject) => {
      setTimeout(() => {
        resolve("a");
      }, 3000);
    });

    const allb = getPromise(e, (resolve, reject) => {
      setTimeout(() => {
        resolve("b");
      }, 10);
    });

    const allc = getPromise(e, (resolve, reject) => {
      setTimeout(() => {
        resolve("c");
      }, 5);
    });

    (e ? Promise : MyPromise).all([alla, allb, allc]).then(
      (v) => {
        match(e, diffTime(), v);
      },
      (v) => {
        console.error(v);
      }
    );
  },

  STATIC_ANY: function (e) {
    const anya = getPromise(e, (resolve, reject) => {
      setTimeout(() => {
        reject("a");
      }, 3000);
    });

    const anyb = getPromise(e, (resolve, reject) => {
      setTimeout(() => {
        resolve("b");
      }, 2000);
    });

    const anyc = getPromise(e, (resolve, reject) => {
      setTimeout(() => {
        reject("c");
      }, 1000);
    });

    (e ? Promise : MyPromise).any([anya, anyb, anyc]).then(
      (v) => {
        match(e, diffTime(), v);
      },
      (v) => {
        console.error("not log");
      }
    );
  },

  STATIC_ANY_All_REJECT: function (e) {
    const anya = getPromise(e, (resolve, reject) => {
      setTimeout(() => {
        reject("a");
      }, 3000);
    });

    const anyb = getPromise(e, (resolve, reject) => {
      setTimeout(() => {
        reject("b");
      }, 2000);
    });

    const anyc = getPromise(e, (resolve, reject) => {
      setTimeout(() => {
        reject("c");
      }, 1000);
    });
    (e ? Promise : MyPromise).any([anya, anyb, anyc]).then(
      (v) => {
        console.error("not log");
      },
      (v) => {
        match(e, diffTime(), [v]);
      }
    );
  },

  ALLSETTLED: function (e) {
    const allsa = getPromise(e, (resolve, reject) => {
      setTimeout(() => {
        resolve("a");
      }, 1000);
    });

    const allsb = getPromise(e, (resolve, reject) => {
      setTimeout(() => {
        reject("b");
      }, 2000);
    });

    const allsc = getPromise(e, (resolve, reject) => {
      setTimeout(() => {
        reject("c");
      }, 300);
    });

    (isPromise(e) ? Promise : MyPromise).allSettled([allsa, allsb, allsc]).then(
      (v) => {
        match(e, diffTime(), v);
      },
      (v) => {
        console.error(v);
      }
    );
  },
};
