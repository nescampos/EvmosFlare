// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

$(function () {
    var publicKey = localStorage.getItem('publicKey');
    if (publicKey != null) {
        $('#loginMenu').css('display', 'none');
        $('#logoutMenu').css('display', 'block');
    }
    else {
        $('#loginMenu').css('display', 'block');
        $('#logoutMenu').css('display', 'none');
    }

    var evmosNetwork = localStorage.getItem('evmosnetwork');
    if (evmosNetwork != null) {
        $('#networkEvmos').text(evmosNetwork);
    }
    else {
        $('#networkEvmos').text('Mainnet');
    }
})

function changeNetwork() {
    var evmosNetwork = localStorage.getItem('evmosnetwork');
    if (evmosNetwork != null) {
        localStorage.setItem('evmosnetwork', evmosNetwork == 'Testnet'? 'Mainnet':'Testnet');
    }
    else {
        localStorage.setItem('evmosnetwork', 'Testnet');
    }
    location.reload();
}

function getWeb3Provider() {
    var web3 = new Web3(new Web3.providers.HttpProvider("https://eth.bd.evmos.org:8545"));
    var evmosNetwork = localStorage.getItem('evmosnetwork');
    if (evmosNetwork != null && evmosNetwork == 'Testnet') {
        web3 = new Web3(new Web3.providers.HttpProvider("https://eth.bd.evmos.dev:8545"));
    }
    else {
        web3 = new Web3(new Web3.providers.HttpProvider("https://eth.bd.evmos.org:8545"));
    }
    return web3;
}

var covalentAPI = '';



var pools = [];
var myPools = [];
var balances = [];

function createNewAccount() {
    var web3 = getWeb3Provider();
    const keyring = web3.eth.accounts.create();
    $('.newAccountPublicKey').text(keyring.address);
    $('.newAccountPrivateKey').text(keyring.privateKey);
}

function confirmNewAccount() {
    var publicKey = $('.newAccountPublicKey').text();
    var privateKey = $('.newAccountPrivateKey').text();
    var passWord = $('.newpassWord').val();
    if (passWord == null) {
        alert('Please, add a new password for your wallet.');
    }
    var web3 = getWeb3Provider();
    web3.eth.accounts.wallet.clear();
    web3.eth.accounts.wallet.add(privateKey);
    localStorage.setItem('publicKey', publicKey);
    web3.eth.accounts.wallet.save(passWord);
    location.href = "/Wallet/Index";
}

function login() {
    var web3 = getWeb3Provider();
    if (localStorage.getItem('web3js_wallet') == null) {
        alert('You do not have an associated Polygon account. Please register an existing account or create a new.');
    }
    else {
        var privateKey = $('.password').val();
        var account = web3.eth.accounts.wallet.load(privateKey)[0];
        localStorage.setItem('publicKey', account.address);
        location.href = "/Wallet/Index";
    }

}

function loginExistingAccount() {
    var web3 = getWeb3Provider();
    var privateKey = $('.privateKeyAccount').val();
    var passWord = $('.newPassword').val();
    if (passWord == null) {
        alert('Please, add a new password for your wallet.');
    }
    localStorage.setItem('publicKey', web3.eth.accounts.privateKeyToAccount(privateKey).address);
    web3.eth.accounts.wallet.clear();
    web3.eth.accounts.wallet.add(privateKey);
    web3.eth.accounts.wallet.save(passWord);
    location.href = "/Wallet/Index";
}

function logout() {
    var publicKey = localStorage.getItem('publicKey');
    //web3.eth.accounts.wallet.clear();
    localStorage.removeItem('publicKey');
    location.href = "/Home/Login";
}

function getBalances() {
    var web3 = getWeb3Provider();
    var publicKey = localStorage.getItem('publicKey');
    var network = localStorage.getItem('evmosnetwork');
    var urlCovalent = network != null ? (network == 'Mainnet' ? 'https://api.covalenthq.com/v1/9001/address/' : 'https://api.covalenthq.com/v1/9000/address/') : 'https://api.covalenthq.com/v1/9001/address/';
    
    const settings = {
        "async": true,
        "crossDomain": true,
        "url": urlCovalent + publicKey + "/balances_v2/?key=" + covalentAPI,
        "method": "GET"
    };
    $.ajax(settings).done(function (response) {
        var tokenSymbol = network != null ? (network == 'Mainnet' ? 'EVMOS' : 'PHOTON') : 'EVMOS';
        var klayToken = response.data.items.find(x => x.contract_ticker_symbol === tokenSymbol);
        var klayBalance = web3.utils.fromWei(klayToken.balance);
        var urlToken = network != null ? (network == 'Mainnet' ? 'https://evm.evmos.org/token/' : 'https://evm.evmos.dev/token/') : 'https://evm.evmos.org/token/';
        $('#klayBalanceAccount').text(klayBalance);
        var list = document.querySelector('.tokenList');
        var table = document.createElement('table');
        var thead = document.createElement('thead');
        var tbody = document.createElement('tbody');

        var theadTr = document.createElement('tr');
        var contractNameHeader = document.createElement('th');
        contractNameHeader.innerHTML = 'Token';
        theadTr.appendChild(contractNameHeader);
        var contractTickerHeader = document.createElement('th');
        contractTickerHeader.innerHTML = 'Ticker';
        theadTr.appendChild(contractTickerHeader);
        var balanceHeader = document.createElement('th');
        balanceHeader.innerHTML = 'Balance';
        theadTr.appendChild(balanceHeader);
        var usdHeader = document.createElement('th');
        usdHeader.innerHTML = 'USD';
        theadTr.appendChild(usdHeader);

        thead.appendChild(theadTr)

        table.className = 'table';
        table.appendChild(thead);
        for (j = 0; j < response.data.items.length; j++) {
            var tbodyTr = document.createElement('tr');
            var contractTd = document.createElement('td');
            var urlToken = urlToken + response.data.items[j].contract_address;
            contractTd.innerHTML = "<b> <a href='" + urlToken + "' target='_blank''>" + response.data.items[j].contract_name + "</a></b>";
            tbodyTr.appendChild(contractTd);
            var contractTickerTd = document.createElement('td');
            contractTickerTd.innerHTML = '<b>' + response.data.items[j].contract_ticker_symbol + '</b>';
            tbodyTr.appendChild(contractTickerTd);
            balances.push(contractTickerTd);
            var balanceTd = document.createElement('td');
            balanceTd.innerHTML = '<b>' + web3.utils.fromWei(response.data.items[j].balance) + '</b>';
            tbodyTr.appendChild(balanceTd);
            var balanceUSDTd = document.createElement('td');
            balanceUSDTd.innerHTML = '<b>' + response.data.items[j].quote + '</b>';
            tbodyTr.appendChild(balanceUSDTd);
            tbody.appendChild(tbodyTr);
        }
        table.appendChild(tbody);

        list.appendChild(table);
    });
}

function dynamicSort(property) {
    var sortOrder = 1;
    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a, b) {
        /* next line works with strings and numbers, 
         * and you may want to customize it to your needs
         */
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

function getXYKPoolsByAddress(dex) {
    const settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api.covalenthq.com/v1/9001/xy=k/" + dex + "/pools/address/" + localStorage.getItem('publicKey') + "/?key=" + covalentAPI,
        "method": "GET",
        "headers": {
            "content-type": "application/json",
        },
        "processData": false
    };
    var tbody = document.getElementById('tbody_pools');

    $("#tbody_pools").empty();

    $.ajax(settings).done(function (response) {
        response.data.items.forEach(function (valor, indice, array) {
            var token_0_avai = balances.indexOf(valor.token_0.contract_name) != -1;
            var token_1_avai = balances.indexOf(valor.token_1.contract_name) != -1;
            myPools.push({
                annualized_fee: valor.annualized_fee, block_height: valor.block_height, dex_name: valor.dex_name, total_liquidity_quote: valor.total_liquidity_quote
                , token_0_contract_name: valor.token_0.contract_name, token_0_contract_ticker_symbol: valor.token_0.contract_ticker_symbol, token_0_logo_url: valor.token_0.logo_url
                , token_1_contract_name: valor.token_1.contract_name, token_1_contract_ticker_symbol: valor.token_1.contract_ticker_symbol, token_1_logo_url: valor.token_1.logo_url
                , token_0_available: token_0_avai, token_1_available: token_1_avai, exchange: valor.exchange
            });
        });

        renderTablemyPools();
    }).fail(function (response) {
        console.log(response);
    });
}

function getXYKPools(dex) {
    const settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api.covalenthq.com/v1/9001/xy=k/" + dex + "/pools/?key=" + covalentAPI,
        "method": "GET",
        "headers": {
            "content-type": "application/json",
        },
        "processData": false
    };

    $.ajax(settings).done(function (response) {
        response.data.items.forEach(function (valor, indice, array) {
            var token_0_avai = balances.indexOf(valor.token_0.contract_name) != -1;
            var token_1_avai = balances.indexOf(valor.token_1.contract_name) != -1;
            pools.push({
                annualized_fee: valor.annualized_fee, block_height: valor.block_height, dex_name: valor.dex_name, total_liquidity_quote: valor.total_liquidity_quote
                , token_0_contract_name: valor.token_0.contract_name, token_0_contract_ticker_symbol: valor.token_0.contract_ticker_symbol, token_0_logo_url: valor.token_0.logo_url
                , token_1_contract_name: valor.token_1.contract_name, token_1_contract_ticker_symbol: valor.token_1.contract_ticker_symbol, token_1_logo_url: valor.token_1.logo_url
                , token_0_available: token_0_avai, token_1_available: token_1_avai, exchange: valor.exchange
            });
        });
        renderTable();
    }).fail(function (response) {
        console.log(response);
    });
}

function renderTablemyPools(filter_by_availability) {
    var pools_render = myPools.sort(dynamicSort('annualized_fee')).reverse();;
    if (filter_by_availability) {
        pools_render = pools_render.filter(x => x.token_0_available == true || x.token_1_available == true)
    }
    var tbody = document.getElementById('tbody_pools');

    $("#tbody_pools").empty();

    for (var i = 0; i < pools_render.length; i++) {
        var tr = "<tr>";
        var url = pools_render[i].dex_name == "diffusion" ? "https://app.diffusion.fi/#/add/v2/" + pools_render[i].exchange : "https://app.evmoswap.org/add/EVMOS/" + pools_render[i].exchange;
        /* Must not forget the $ sign */
        tr += "<td> " + pools_render[i].dex_name + "</td>" + "<td>" + pools_render[i].token_0_contract_name + " (" + pools_render[i].token_0_contract_ticker_symbol + ")</td>" + "<td>" + pools_render[i].token_1_contract_name + " (" + pools_render[i].token_1_contract_ticker_symbol + ")</td>" + "<td>" + pools_render[i].total_liquidity_quote + "</td>" + "<td>" + pools_render[i].block_height + "</td>" + "<td>" + (pools_render[i].annualized_fee * 100).toFixed(2) + "%" + "</td></tr>";

        /* We add the table row to the table body */
        tbody.innerHTML += tr;
    }
}

function renderTable(filter_by_availability) {
    var pools_render = pools.sort(dynamicSort('annualized_fee')).reverse();;
    if (filter_by_availability) {
        pools_render = pools_render.filter(x => x.token_0_available == true || x.token_1_available == true)
    }
    var tbody = document.getElementById('tbody_pools');

    $("#tbody_pools").empty();

    for (var i = 0; i < pools_render.length; i++) {
        var tr = "<tr>";
        var url = pools_render[i].dex_name == "diffusion" ? "https://app.diffusion.fi/#/add/v2/" + pools_render[i].exchange : "https://app.evmoswap.org/add/EVMOS/" + pools_render[i].exchange;
        /* Must not forget the $ sign */
        tr += "<td> " + pools_render[i].dex_name + "</td>" + "<td>" + pools_render[i].token_0_contract_name + " (" + pools_render[i].token_0_contract_ticker_symbol + ")</td>" + "<td>" + pools_render[i].token_1_contract_name + " (" + pools_render[i].token_1_contract_ticker_symbol + ")</td>" + "<td>" + pools_render[i].total_liquidity_quote + "</td>" + "<td>" + pools_render[i].block_height + "</td>" + "<td>" + (pools_render[i].annualized_fee * 100).toFixed(2) + "%" + "</td></tr>";

        /* We add the table row to the table body */
        tbody.innerHTML += tr;
    }
}

function getTransactions() {
    var publicKey = localStorage.getItem('publicKey');
    var network = localStorage.getItem('evmosnetwork');
    var urlCovalent = network != null ? (network == 'Mainnet' ? 'https://api.covalenthq.com/v1/9001/address/' : 'https://api.covalenthq.com/v1/9000/address/') : 'https://api.covalenthq.com/v1/9001/address/';
    const settings = {
        "async": true,
        "crossDomain": true,
        "url": urlCovalent + publicKey + "/transactions_v2/?quote-currency=USD&format=JSON&block-signed-at-asc=false&no-logs=false&page-number=0&key=" + covalentAPI,
        "method": "GET"
    };
    $.ajax(settings).done(function (response) {
        var urlToken = network != null ? (network == 'Mainnet' ? 'https://evm.evmos.org/tx/' : 'https://evm.evmos.dev/tx/') : 'https://evm.evmos.org/tx/';
        if (response.data.items.length == 0) {
            $('#noTransactions').css('display', 'block');
            $('#noTransactions').text('There is no transaction for this address.');
        }
        else {
            $('#noTransactions').css('display', 'none');
            var list = document.querySelector('.transactionList');
            var table = document.createElement('table');
            var thead = document.createElement('thead');
            var tbody = document.createElement('tbody');


            var theadTr = document.createElement('tr');
            var contractNameHeader = document.createElement('td');
            contractNameHeader.innerHTML = 'Trx Hash';
            theadTr.appendChild(contractNameHeader);
            var contractTickerHeader = document.createElement('td');
            contractTickerHeader.innerHTML = 'From Address';
            theadTr.appendChild(contractTickerHeader);
            var contractTickerHeader = document.createElement('td');
            contractTickerHeader.innerHTML = 'To Address';
            theadTr.appendChild(contractTickerHeader);
            var balanceHeader = document.createElement('td');
            balanceHeader.innerHTML = 'Amount';
            theadTr.appendChild(balanceHeader);
            var usdHeader = document.createElement('td');
            usdHeader.innerHTML = 'USD';
            theadTr.appendChild(usdHeader);
            var usdHeader = document.createElement('td');
            usdHeader.innerHTML = 'Fees';
            theadTr.appendChild(usdHeader);

            thead.appendChild(theadTr);
            table.className = 'table';
            table.appendChild(thead);

            for (j = 0; j < response.data.items.length; j++) {
                var tbodyTr = document.createElement('tr');
                var contractTd = document.createElement('td');
                var url = urlToken + response.data.items[j].tx_hash;
                contractTd.innerHTML = "<b><a href='" + url + "' target='_blank'>" + response.data.items[j].tx_hash.substring(0, 10) + "...</a></b>";
                tbodyTr.appendChild(contractTd);
                var contractFromTickerTd = document.createElement('td');
                contractFromTickerTd.innerHTML = response.data.items[j].from_address != null ? response.data.items[j].from_address.substring(0, 10) + "..." : "-";
                tbodyTr.appendChild(contractFromTickerTd);
                var contractTickerTd = document.createElement('td');
                contractTickerTd.innerHTML = response.data.items[j].to_address != null ? response.data.items[j].to_address.substring(0, 10) + "..." : "-";
                tbodyTr.appendChild(contractTickerTd);
                var balanceTd = document.createElement('td');
                balanceTd.innerHTML = web3.utils.fromWei(response.data.items[j].value.toString());
                tbodyTr.appendChild(balanceTd);
                var balanceUSDTd = document.createElement('td');
                balanceUSDTd.innerHTML = response.data.items[j].value_quote;
                tbodyTr.appendChild(balanceUSDTd);
                var contractIdTd = document.createElement('td');
                contractIdTd.innerHTML = response.data.items[j].fees_paid != null ? web3.utils.fromWei(response.data.items[j].fees_paid.toString()) : '-';
                tbodyTr.appendChild(contractIdTd);
                tbody.appendChild(tbodyTr);
            }
            table.appendChild(tbody);

            list.appendChild(table);
        }
    });
}

function sendTransaction() {
    var web3 = getWeb3Provider();
    var recipient = $('#trx_address').val();
    if (recipient == '') {
        $('#errorTrx').css("display", "block");
        $('#errorTrx').text("Recipient is invalid");
        return;
    }
    var amount = $('#trx_amount').val();
    if (amount == '') {
        $('#errorTrx').css("display", "block");
        $('#errorTrx').text("Amount is invalid");
        return;
    }
    var password = $('#password').val();
    if (amount == '') {
        $('#errorTrx').css("display", "block");
        $('#errorTrx').text("Please enter your password");
        return;
    }
    var publicKey = localStorage.getItem('publicKey');

    web3.eth.sendTransaction({
        from: publicKey,
        to: recipient,
        value: web3.utils.toWei(amount, "ether"),
        data: ""
    }, password, function (err, transactionHash) {
        $('#errorTrx').css("display", "block");
        if (!err) {
            $('#errorTrx').text(transactionHash + " success");
        }
        else {
            $('#errorTrx').text("Error in the transaction. Please, check the data.");
        }
            
    });
}