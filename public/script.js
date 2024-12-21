// Lấy các phần tử trong DOM
const number1 = document.getElementById('number1');
const operator = document.getElementById('operator');
const number2 = document.getElementById('number2');
const calculateBtn = document.getElementById('calculateBtn');
const resultDiv = document.getElementById('result');
const historyList = document.getElementById('history');

// API URL
const API_URL = '/api/history';

// Hiển thị thông báo lỗi
function setError(message) {
    resultDiv.textContent = 'Error: ' + message;
    resultDiv.classList.add('error');
    resultDiv.classList.remove('success');
}

// Hiển thị kết quả
function setSuccess(message) {
    resultDiv.textContent = message;
    resultDiv.classList.add('success');
    resultDiv.classList.remove('error');
}

// Hàm lấy giá trị nhập vào từ các ô input
function getVal(input) {
    return parseFloat(input.value);
}

// Hàm lấy phép toán nhập vào
function getOperator(operatorInput) {
    return operatorInput.value.trim();
}

// Kiểm tra đầu vào
function validateInputs(n1, n2, oper) {
    if (isNaN(n1) || isNaN(n2)) {
        throw new Error('1 hoặc 2 số không hợp lệ.');
    }
    if (!['+', '-', '*', '/'].includes(oper)) {
        throw new Error('Toán tử không hợp lệ.');
    }
    if (oper === '/' && n2 === 0) {
        throw new Error('Chia cho số 0.');
    }
}

// Hàm thêm lịch sử phép tính vào giao diện
function addHistoryItem(entry) {
    const historyItem = document.createElement('li');
    historyItem.textContent = entry;
    historyList.appendChild(historyItem);
}

// Hàm tải lịch sử từ máy chủ
async function loadHistory() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Không tải được lịch sử.');
        }
        const data = await response.json();
        historyList.innerHTML = ''; // Xóa lịch sử cũ
        data.data.forEach(entry => addHistoryItem(entry));
    } catch (error) {
        console.error('Lỗi khi tải lịch sử:', error);
    }
}

// Hàm lưu lịch sử lên máy chủ
async function saveToHistory(entry) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ entry }),
        });
        if (!response.ok) {
            throw new Error('Không lưu được vào lịch sử.');
        }
        await loadHistory(); // Tải lại lịch sử sau khi lưu
    } catch (error) {
        console.error('Lỗi khi lưu vào lịch sử', error);
    }
}

// Hàm cập nhật lịch sử trên máy chủ
async function updateHistory(id, updatedEntry) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ entry: updatedEntry }),
        });
        if (!response.ok) {
            throw new Error('Không cập nhập được lịch sử.');
        }
        await loadHistory(); // Tải lại lịch sử sau khi cập nhật
    } catch (error) {
        console.error('Lỗi không cập nhật được lịch sử:', error);
    }
}

// Hàm tính toán
async function calculate() {
    try {
        const n1 = getVal(number1);
        const n2 = getVal(number2);
        const oper = getOperator(operator);

        validateInputs(n1, n2, oper);

        // Thực hiện phép tính
        const result = eval(`${n1} ${oper} ${n2}`);

        // Hiển thị kết quả và lưu vào lịch sử
        const entry = `${n1} ${oper} ${n2} = ${result}`;
        setSuccess(entry);
        await saveToHistory(entry);
    } catch (error) {
        setError(error.message);
    }
}

// Lắng nghe sự kiện click vào nút "Calculate"
calculateBtn.addEventListener('click', () => {
    console.log('Input values:', number1.value, operator.value, number2.value);
    calculate();
});

// Khởi tạo
loadHistory();
