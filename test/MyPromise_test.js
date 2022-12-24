let startTime;
let allMode;
let expectedTime;
let expectedValues;
let testingButton;

function getPromise(e, executor) {
  return isPromise(e) ? new Promise(executor) : new MyPromise(executor);
}

function isPromise(e) {
  return (
    e === "Promise" ||
    e?.innerText === "Promise" ||
    e?.target?.innerText === "Promise"
  );
}

function diffTime() {
  return new Date().getTime() - startTime.getTime();
}

function pairSameDisable(pairBtn, flag) {
  for (let i = 0; i < 2; i++) {
    pairBtn[i].disabled = flag;
  }
}

function buttonDisable(pairBtn, e) {
  const isStart = !!e;
  if (isStart) {
    pairSameDisable(pairBtn, true);
  } else if (!isPromise(testingButton)) {
    if (testingButton === pairBtn[0]) {
      pairBtn[1].disabled = false;
    } else {
      pairSameDisable(pairBtn, true);
    }
  } else {
    pairSameDisable(pairBtn, false);
  }
}

function changeButtonDisable(e = null) {
  if (e) testingButton = e.target;
  btns.childNodes.forEach((group) => {
    const pairBtn = group.getElementsByTagName("BUTTON");
    buttonDisable(pairBtn, e);
  });
}

function getResult(MyPromiseValue, PromiseValue) {
  if (MyPromiseValue instanceof Error) {

    return MyPromiseValue.message === PromiseValue.message;
  } else if (MyPromiseValue instanceof Object) {
    return (
      MyPromiseValue.state === PromiseValue.state &&
      MyPromiseValue.value === PromiseValue.value
    );
  } else {
    return MyPromiseValue === PromiseValue;
  }
}

function setExpected(time, values) {
  expectedTime = time;
  expectedValues = values;
}

function changeBackColor(node, color = "gray") {
  if (node?.style?.background === "red") return;
  node.style.background = color;
}

function logTime(rt, time) {
  if (rt) {
    console.log("time OK!!");
    console.log("MP_time:", expectedTime, "P_time:", time);
  } else {
    console.error("time NG!!");
    console.error("MP_time:", expectedTime, "P_time:", time);
    changeBackColor(testingButton.parentNode, "red");
  }
}

function logValues(values, e) {
  for (let i = 0; i < values.length; i++) {
    const matchResult = getResult(expectedValues[i], values[i]);
    if (matchResult) {
      console.log("value OK!!");
      console.log("MyPromise:", expectedValues[i]);
      console.log("Promise:", values[i]);
    } else {
      console.error("error!!");
      console.log("MyPromise:", expectedValues[i]);
      console.log("Promise:", values[i]);
      changeBackColor(e.target.parentNode, "red");
    }
  }
}

function match(e, time, values) {
  if (!isPromise(e)) {
    console.log("【ログ: MyPromiseEnd】");
    setExpected(time, values);
  } else {
    console.log("【ログ: PromiseEnd】");
    const rt = Math.abs(expectedTime - time) < 10;
    logTime(rt, time);
    logValues(values, e);
  }
  changeButtonDisable();
}

function wait(checkDisabledDom, cb) {
  const int = setInterval(() => {
    if (!checkDisabledDom.disabled) {
      cb();
      clearInterval(int);
    } else {
      console.log("wait...");
    }
  }, 500);
}

function finish(now) {
  allMode = false;
  document.getElementById("run").disabled = allMode;
  changeBackColor(now.parentNode);
  console.log("finish");
}

function next(btns) {
  const isLast = btns.length <= 1;
  const now = btns.shift();
  now.disabled = false;
  now.click();
  if (!isLast) {
    const standBy = btns[0];
    wait(standBy, () => {
      const isPromise = standBy.nextElementSibling;
      if (isPromise) changeBackColor(now.parentNode);
      next(btns);
    });
  } else {
    wait(now, () => {
      finish(now);
    });
  }
}

function reset() {
  startTime = null;
  allMode = false;
  expectedTime = null;
  expectedValues = null;
  testingButton = null;
  console.clear();
}

function runAll() {
  reset();
  allMode = true;
  document.getElementById("run").disabled = allMode;
  const b = btns.getElementsByTagName("button");
  next(Array.from(b));
}

function createRun() {
  const run = document.getElementById("run");
  run.addEventListener("click", (e) => {
    e.stopPropagation();
    runAll();
  });
}

function createStop() {
  const stop = document.getElementById("stop");
  stop.addEventListener("click", () => {
    debugger;
  });
}

function test(title, e) {
  startTime = new Date();
  changeButtonDisable(e);
  if (!isPromise(e) && !allMode) {
    console.clear();
  }
  console.log(
    isPromise(e)
      ? "----------- result ----------- "
      : `================ ${title} ================ `
  );
  testObject[title](e);
}

function createPairBtn(title, group) {
  for (const p of ["MyPromise", "Promise"]) {
    const btn = document.createElement("button");
    btn.innerText = p;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      test(title, e);
    });
    btn.disabled = isPromise(p);
    group.appendChild(btn);
  }
}

function createTitle(title, group) {
  const testTitle = document.createElement("p");
  testTitle.innerText = title;
  group.appendChild(testTitle);
}

function createGroup(title) {
  const group = document.createElement("div");
  group.className = title;
  createTitle(title, group);
  createPairBtn(title, group);
  return group;
}

function createTestButtons() {
  const btns = document.getElementById("btns");
  const titles = Object.keys(testObject);
  for (const title of titles) {
    const group = createGroup(title);
    btns.appendChild(group);
  }
}

function createDom() {
  createRun();
  createStop();
  createTestButtons();
}

createDom();

document.addEventListener(
  "keydown",
  (e) => {
    if (e.ctrlKey) {
      if (e.code === "KeyC") {
        debugger;
      }
    }
  },
  false
);
