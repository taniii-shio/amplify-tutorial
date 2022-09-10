import React, { useEffect, useState } from "react";
import Amplify, { API } from "aws-amplify";
import { withAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

import { createTodo } from "./graphql/mutations";
import { listTodos } from "./graphql/queries";
import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const initialState = { name: "", description: "" };

const App = ({ signOut, user }) => {
  const [formState, setFormState] = useState(initialState);
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    fetchTodos();
  }, []);

  const setInput = (key, value) => {
    setFormState({ ...formState, [key]: value });
  };

  const fetchTodos = async () => {
    try {
      const todoData = await API.graphql({
        query: listTodos,
        authMode: "AMAZON_COGNITO_USER_POOLS",
      });
      const todos = todoData.data.listTodos.items;
      setTodos(todos);
    } catch (err) {
      console.log("error fetching todos");
    }
  };

  const addTodo = async () => {
    try {
      if (!formState.name || !formState.description) return;
      const todo = { ...formState };
      setTodos([...todos, todo]);
      setFormState(initialState);
      await API.graphql({
        query: createTodo,
        variables: { input: todo },
        authMode: "AMAZON_COGNITO_USER_POOLS",
      });
    } catch (err) {
      console.log("error creating todo:", err);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Amplify Todos</h2>
      {user ? (
        <>
          <div style={styles.userinfoWrapper}>
            <h3>user : {user.username}</h3>
            <button style={styles.signoutButton} onClick={signOut}>
              sign out
            </button>
          </div>
          <input
            onChange={(event) => setInput("name", event.target.value)}
            style={styles.input}
            value={formState.name}
            placeholder="Name"
          />
          <input
            onChange={(event) => setInput("description", event.target.value)}
            style={styles.input}
            value={formState.description}
            placeholder="Description"
          />
          <button style={styles.button} onClick={addTodo}>
            Create Todo
          </button>
          {todos.map((todo, index) => (
            <div key={todo.id ? todo.id : index} style={styles.todo}>
              <p style={styles.todoName}>{todo.name}</p>
              <p style={styles.todoDescription}>{todo.description}</p>
            </div>
          ))}
        </>
      ) : (
        <h3>権限がありません</h3>
      )}
    </div>
  );
};

const styles = {
  container: {
    width: 400,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: 20,
  },
  userinfoWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  signoutButton: {
    backgroundColor: "black",
    color: "white",
    outline: "none",
    fontSize: 18,
    padding: "12px 0px",
    height: "40px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "20px",
  },
  todo: { marginBottom: 15 },
  input: {
    border: "none",
    backgroundColor: "#ddd",
    marginBottom: 10,
    padding: 8,
    fontSize: 18,
  },
  todoName: { fontSize: 20, fontWeight: "bold" },
  todoDescription: { marginBottom: 0 },
  button: {
    backgroundColor: "black",
    color: "white",
    outline: "none",
    fontSize: 18,
    padding: "12px 0px",
  },
};

export default withAuthenticator(App);
