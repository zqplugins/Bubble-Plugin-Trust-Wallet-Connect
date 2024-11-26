function(instance, properties, context) {

    if(!instance.data.injectedProvider){
        instance.publishState("error", "Trust is not detected");
        instance.triggerEvent("error");
        return;
    }

    (async function(){
        try {
            const account = await instance.data.injectedProvider.request({
                method: "eth_requestAccounts",
            });
            
            if(account.length > 0){
                
                let chain_id = await instance.data.injectedProvider.request({
                    "method": "eth_chainId",
                });
                
                instance.publishState("chain_id", instance.data.web3.utils.hexToNumber(chain_id));
                instance.publishState("address_id", account[0]);
                instance.publishState("is_connected", true);
            }else{
                instance.publishState("is_connected", false);
                instance.publishState("address_id", "");
                instance.publishState("chain_id", "");
            }
        } catch (error) {
            instance.publishState("error", error.message);
            instance.triggerEvent("error");
        }
    })()
    
    /*let chain_id = await instance.data.injectedProvider.request({
                    "method": "eth_chainId",
                });*/
}