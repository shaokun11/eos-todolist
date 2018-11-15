import React, { Component } from 'react';
import './App.css';
import ScatterJS from 'scatterjs-core';
import ScatterEOS from 'scatterjs-plugin-eosjs';
import Eos from 'eosjs';

ScatterJS.plugins( new ScatterEOS());


const network = {
    blockchain:'eos',
    protocol:'http',
    host:'jungle.cryptolions.io',
    port:18888,
    chainId:'038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca'
}

class App extends Component {

   state = {
       deleteId:1,
       rows:[],
       competedId:1,
       scatter:null
  }

    componentDidMount() {
        setTimeout(() => {
            this.init()
        }, 2000)
    }

    takeAction(action,params){
       console.log(action,params)
        const requiredFields = { accounts:[network] };
        this.state.scatter.getIdentity(requiredFields).then(() => {
            const account = this.state.scatter.identity.accounts.find(x => x.blockchain === 'eos');
            console.log(account)
            const eosOptions = { expireInSeconds:60 };
            const eos = this.state.scatter.eos(network,Eos,eosOptions);
            const transactionOptions = { authorization:[`${account.name}@${account.authority}`] };
             eos.contract("shaokun11113").then(ins => {
                return ins[action](account.name, ...params, transactionOptions)
            }).then(res => {
                console.log(res);
            }).catch(error => {
                console.error(error);
            });

        }).catch(error => {
            console.error("tack action",error);
        });
    }

    init() {
        ScatterJS.scatter.connect('todolist').then(connected => {
            if(!connected) return false;

            const scatter = ScatterJS.scatter;
            this.setState({
                scatter
            });
            alert("scatter load success")
        }).then(err=>{
          console.log(err)
        });
    }

    showTodo(){
        this.state.scatter.eos(network,Eos).getTableRows({code: "shaokun11113", scope: "shaokun11113",table: "tood", json: true})
        .then(res=>{
            this.setState({
                rows:res.rows
            })
        })
    }

    render() {
    return (
        <div>

            <div>
                <button onClick={() => {
                    const num = Math.floor(Math.random() * 100000);
                    this.takeAction("create",[num,"this is number "+num])
                }}>create todo</button>
                <button onClick={() => this.takeAction("delete",[this.state.deleteId])}>delete todo</button>
                <input type="text" onChange={e => {
                    this.setState({
                        deleteId: Number.parseInt(e.target.value)
                    })
                }}/>

                <button onClick={() => this.takeAction("complete",[this.state.competedId])}>complete todo</button>
                <input type="text" onChange={e => {
                    this.setState({
                        competedId: Number.parseInt(e.target.value)
                    })
                }}/>
                <button onClick={() => this.showTodo()}>show todo</button>
            </div>
            <div>
                <p>below is data</p>
                <ul>
                    {
                        this.state.rows.map((todo, index) => {
                            return <li key={index}>
                                <p>id : {todo.id}</p>
                                <p>description : {todo.description}</p>
                                <p>completed : {todo.completed}</p>
                            </li>
                        })
                    }
                </ul>
            </div>
        </div>
    );
  }
}

export default App;
