const express = require('express');
const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.post('/split-payments/compute', (req, res) => {
    requested = req.body;
    splitInfo = req.body.SplitInfo;
    newSplitInfo = splitInfo.map(splitInfo => {
        flatSum = 0;
        ratio = 0;
        if (splitInfo.SplitType === "FLAT"){
            splitInfo.order = 1;
            flatSum += splitInfo.SplitValue; 
        }
    
        if (splitInfo.SplitType === "PERCENTAGE"){
            splitInfo.order = 2;
        }
    
        if (splitInfo.SplitType === "RATIO"){
            splitInfo.order = 3;
            ratio  = ratio + splitInfo.SplitValue;
            splitInfo.ratio = ratio;
        }
        return splitInfo;
    })
    

    sortSplitInfo = newSplitInfo.sort((a, b) => a.order > b.order ? 1 : -1);

    balance = requested.Amount;

   totalBalance = sortSplitInfo.forEach((info)=>{
             
            do { 
                if (info.SplitType === "FLAT" && balance > flatSum){
                    balance = balance - info.SplitValue;
                   
                }

                if (info.SplitType === "PERCENTAGE" && info.SplitValue <= 100 && info.SplitValue >= 0){ 
                    info.SplitValue = balance - ((info.SplitValue / 100) * balance);
                    balance = balance - info.SplitValue;
                   
                }

                if (info.SplitType === "RATIO" && info.SplitValue >= 0){
                    info.SplitValue = balance - ((info.SplitValue / info.ratio) * balance);
                    balance = balance - info.SplitValue;
                    
                }
                
                return balance;

            } while (balance < requested.Amount && balance >= 0);
            
    })
    console.log(totalBalance);


    splitBreakdown = sortSplitInfo.map(info => {
        breakdown = [];
        breakdown.push({
            "SplitEntityId": info.SplitEntityId,
            "Amount": info.SplitValue
        })
        return breakdown;
    })

    response = {
    "ID": requested.ID,
    "Balance": totalBalance,
    "SplitBreakdown": splitBreakdown
}
    res.status(200).json(response);
})
app.listen(3000);
