#include <eosiolib/eosio.hpp>  

using namespace std;

class [[eosio::contract]] todolist : public eosio::contract {  
  public:
      
  todolist(eosio::name reciever, eosio::name code, eosio::datastream<const char*> ds)
                                                        :contract(reciever,code,ds),
                                                         todos(reciever,code.value){};   


  [[eosio::action]]   
  void create(eosio::name author, const uint32_t id, const string& description) {
    todos.emplace(author, [&](auto &new_todo) {
        new_todo.id = id;
        new_todo.description = description;
        new_todo.completed = 0;
    });
   }

  [[eosio::action]]
  void complete(eosio::name author,const uint32_t id)
  {  
      eosio::require_auth(author);

      auto itr = todos.find(id);
      // 是否用find()方法，去查找这条方法对应的实例
      eosio_assert(itr != todos.end(), "todo does not exit");
    // 这里 如果找不到，todos.end() 会返回 null
      todos.modify(itr,author,[&](auto &t) {
          t.completed = 1;
      });
  }

  [[eosio::action]]
  void destroy(eosio::name author, const uint32_t id){    
     eosio::require_auth(author);
      auto itr = todos.find(id);
      if(itr != todos.end()){
         todos.erase(itr);
      }
  }

  private:
  struct [[eosio::table]] todo {
      uint64_t id;
      string description;
      uint64_t completed;

      uint64_t primary_key() const {
          return id;
      }
  };

  typedef eosio::multi_index<"tood"_n, todo> todo_index;
  todo_index todos;
};

EOSIO_DISPATCH(todolist, (create)(complete)(destroy))

