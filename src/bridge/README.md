# Bridge

Your probably here to see how it works, its not really a bridge but thats what i wanted to call it <br>
or you want to add your chain.

# How it works

So essentially a class is created which contains all the functions (send, fetch balance, etc)<br>
then in the constructor you pass in all the chain data (RpcEndpoint, Lcd, precision, coingeckoid, etc), this works because its all cosmos <br>
Which all that data is contained in the SupportedChain file.

# How to add your chain

1.  Create another object with the name of your chain name under "ChainData" (Convention)
2.  Fill it with all the data seen above it in the file
3.  Then below "ChainData" under "OptionBuilder" add another object.
4.  name should be the name of your coin, and value should be the name you inputed for you chain in ChainData

Better guide soon probably
