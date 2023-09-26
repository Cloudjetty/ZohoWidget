document.addEventListener("DOMContentLoaded", function () {
    let entityId;
    let entityName;

    fetch("https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json")
        .then((response) => response.json())
        .then((data) => {
            const nbuRate = data.find(currency => currency.cc === 'USD');
            document.getElementById("nbu-rate").value = nbuRate.rate;
            calculateRateDifference();
        })
        .catch((error) => {
            console.error("NBU Rate Error:", error);
        });

    ZOHO.embeddedApp.on("PageLoad", function (data) {
        if (data && data.Entity) {
            entityId = data.EntityId;
            entityName = data.Entity;

            ZOHO.CRM.API.getRecord({ Entity: data.Entity, RecordID: data.EntityId })
                .then(function (data) {
                    const dealRate = parseFloat(data.data[0].Exchange_Rates);
                    document.getElementById("deal-rate").value = dealRate;
                    calculateRateDifference();
                })
                .catch(function (error) {
                    console.error("Error Deal Rate:", error);
                });
        }
    });

    function calculateRateDifference() {
        const nbuRate = parseFloat(document.getElementById("nbu-rate").value);
        const dealRate = parseFloat(document.getElementById("deal-rate").value);

        if (!isNaN(nbuRate) && !isNaN(dealRate)) {
            const rateDifference = ((nbuRate - dealRate) / nbuRate) * 100;
            const roundedDifference = Math.round(rateDifference * 10) / 10;

            document.getElementById("rate-difference").value = roundedDifference;
            document.getElementById("update-deal-rate").style.display = roundedDifference >= 5 ? "block" : "none";
        }
    }

    const updateDealRateButton = document.getElementById("update-deal-rate");
    updateDealRateButton.addEventListener("click", updateDealRate);

    function updateDealRate() {
        const nbuRate = parseFloat(document.getElementById("nbu-rate").value);

        let config = {
            Entity: entityName,
            APIData: {
                "id": entityId,
                "Exchange_Rates": nbuRate
            },
            Trigger: ["workflow"]
        }

        ZOHO.CRM.API.updateRecord(config)
            .then(function (data) {
                console.log("Update field success:" + data);
                alert("Update field success");
                window.location.reload();
            })
            .catch(function (error) {
                console.error("Update field error:", error);
                alert("Update field error: " + error.message);
            });
    }

    ZOHO.embeddedApp.init();
});