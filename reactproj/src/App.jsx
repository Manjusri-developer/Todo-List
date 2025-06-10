import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../src/App.css";

function App() {
  const [todo, setTodo] = useState([]);
  const [check, setCheck] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [newtodo, setNewtodo] = useState("");
  const [modal, setModal] = useState({});
  const [edittext, setEdittext] = useState({});

  const modalRef = useRef(null);

  const getLocalTodos = () => {
    return JSON.parse(localStorage.getItem("NewTodoItems")) || [];
  };

  const setLocalTodos = (todos) => {
    localStorage.setItem("NewTodoItems", JSON.stringify(todos));
  };

  const updateLocalTodo = (id, UpdatedItem) => {
    const updated = getLocalTodos().map((todo) =>
      todo.id === id ? { ...todo, todo: UpdatedItem } : todo
    );
    setLocalTodos(updated);
  };

  const deleteLocalTodo = (Itemid) => {
    const deleted = getLocalTodos().filter((todo) => todo.id !== Itemid);
    setLocalTodos(deleted);
  };

  const colors = [
    "#fffce2",
    "#d9f5f9",
    "#ffe1e4",
    "#ffe6c1",
    "#E1BEE7",
    "#DCEDC8",
  ];

  useEffect(() => {
    const CreateTodos = async () => {
      try {
        const response = await axios.get("https://dummyjson.com/todos");
        const apiTodos = response.data.todos;
        const NewTodos = getLocalTodos();
        const combined = [...apiTodos];

        if (Array.isArray(NewTodos)) {
          NewTodos.forEach((newTodo) => {
            const exists = combined.find((item) => item.id === newTodo.id);
            if (!exists) {
              combined.push(newTodo);
            }
          });
        }
        console.log("------todoss", todo);
        setTodo(combined);
      } catch (error) {
        console.log(error);
      }
    };

    CreateTodos();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      console.log("Clicked element:", event.target);
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setModal({});
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [modal]);

  const HandleCheck = (id) => {
    setCheck((prev) =>
      prev.includes(id) ? prev.filter((items) => items !== id) : [...prev, id]
    );
  };

  const Addtodo = () => {
    setShowInput(!showInput);
  };

  const handleKeydown = async (event) => {
    if (event.key === "Enter" && newtodo.trim() !== "") {
      const todolist = {
        id: Date.now(),
        todo: newtodo,
        completed: false,
        userId: Math.floor(Math.random() * 1000),
        date: new Date().toLocaleString(),
      };
      const response = await axios.post("http://localhost:8000/create", {
        newtodos: todolist,
      });

      const addedTodo = response.data.newtodos;

      const existing = getLocalTodos();

      setLocalTodos([...existing, addedTodo]);

      setTodo((prev) => [...prev, addedTodo]);
      setNewtodo("");
      console.log("----------addedddtodo", todo);
      setShowInput(false);
    }
  };

  const HandleClick = (id, item) => {
    if (modal.index === id) {
      setModal({});
    } else {
      setModal({ index: id, text: item });
      setEdittext({ index: id, todo: item });
    }
  };

  const UpdateTodo = async (id) => {
    try {
      const response = await axios.put(`http://localhost:8000/update/${id}`, {
        updatedText: edittext.todo,
      });
      const UpdatedItem = response.data.updatedTodo;
      updateLocalTodo(id, UpdatedItem);
      setTodo((prevTodos) =>
        prevTodos.map((todos) =>
          todos.id === id ? { ...todos, todo: UpdatedItem } : todos
        )
      );
      setModal({});
    } catch (error) {
      console.log("errorr", error);
    }
  };

  const HandleDelete = async (itemId) => {
    const DeleteTodo = await axios.delete(
      `http://localhost:8000/delete/${itemId}`
    );
    console.log("ddddddddd", DeleteTodo);
    const DeleteItem = parseInt(DeleteTodo.data.deleteId);
    deleteLocalTodo(DeleteItem);
    setTodo((prevTodos) => prevTodos.filter((item) => item.id !== DeleteItem));
    console.log("deleteeeee", todo);
  };

  return (
    <>
      <div
        className="d-flex align-items-center"
        style={{
          height: "100vh",
          background:
            "linear-gradient(190deg,#4e54c8 50%, rgb(218 113 121) 50%)",
        }}
      >
        <div
          className="col-md-9 col-10 col-sm-7 col-lg-10 col-xl-10 container border rounded md-mt-4"
          style={{ background: "white", color: "black" }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <h2 className="text-primary">
              {new Date().toLocaleString("default", {
                weekday: "long",
              })}
              ,{""}
              {(() => {
                const day = new Date().getDate();
                console.log("dayyy",day);

                if (day >= 11 && day <= 20) {
                  return `${day}th`;
                }

                const lastDigit = day % 10;

                if (lastDigit === 1) return `${day}st`;
                if (lastDigit === 2) return `${day}nd`;
                if (lastDigit === 3) return `${day}rd`;

                return `${day}th`;
              })()}
            </h2>

            <p style={{ color: "rgba(128, 128, 128, 0.9)" }}>
              {todo.length} Tasks
            </p>
          </div>
          <span
            className="ms-1"
            style={{ color: "rgba(128, 128, 128, 0.9)", fontFamily: "cursive" }}
          >
            {new Date().toLocaleString("default", {
              month: "long",
            })}
          </span>

          {showInput ? (
            <>
              <input
                type="text"
                placeholder="add here....."
                className="input-text rounded py-1 border-0 text-white mx-2"
                style={{
                  background: "rgb(207, 160, 164)",
                  outline: "none",
                }}
                value={newtodo}
                onChange={(e) => setNewtodo(e.target.value)}
                onKeyDown={handleKeydown}
              />
            </>
          ) : (
            <></>
          )}
          <div className="d-flex gap-4">
            <hr className="" />
            <button
              onClick={() => Addtodo()}
              className="add-button"
              style={{
                border: "none",
                backgroundColor: "rgb(218, 113, 121)",
                marginTop: "-15px",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="26"
                height="26"
                fill="white"
                className="bi bi-plus-lg"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"
                />
              </svg>
            </button>
          </div>

          <ul
            id="Todo-List"
            className="d-flex flex-lg-wrap flex-xl-wrap flex-md-column flex-sm-column flex-column flex-lg-row flex-xl-row p-1"
            style={{
              height: "58vh",
              overflowY: "auto",
              overflowX: "auto",
              justifyContent: "space-between",
              listStyle: "none",
            }}
          >
            {todo
              .filter((todo) => !check.includes(todo.id))
              .map((items, index) => (
                <>
                  <li key={items.id} className="d-flex">
                    <div
                      className="d-flex align-items-center ms-1 me-2 Todo-Item"
                      style={{
                        position: "relative",
                        "--bgcolor": colors[index % colors.length],
                      }}
                    >
                      <input
                        type="checkbox"
                        className="me-3"
                        checked={check.includes(items.id)}
                        onChange={() => HandleCheck(items.id)}
                        style={{
                          width: "20px",
                          height: "20px",
                          accentColor: "rgb(218, 113, 121)",
                          flexShrink: 0,
                        }}
                      />
                      <p
                        className={`py-3 mb-0 ${
                          check.includes(items.id)
                            ? "text-decoration-line-through opacity-50"
                            : ""
                        }`}
                        style={{
                          overflow: "hidden",
                          textAlign: "justify",
                          flexGrow: 1,
                        }}
                      >
                        {items.todo}
                      </p>

                      {modal.index === items.id ? (
                        <>
                          <div ref={modalRef}>
                            <textarea
                              type="text"
                              className="text-area rounded px-2 text-wrap"
                              value={edittext.todo}
                              onChange={(e) =>
                                setEdittext({
                                  ...edittext,
                                  todo: e.target.value,
                                })
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") UpdateTodo(items.id);
                              }}
                              style={{
                                position: "absolute",
                                zIndex: 2,
                                left: 30,
                                top: 30,
                                border: "2px solid rgb(218, 113, 121)",
                                outline: "none",
                                boxShadow:
                                  "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                              }}
                            />
                          </div>
                        </>
                      ) : (
                        ""
                      )}

                      <div
                        className=""
                        style={{
                          color: "rgba(128, 128, 128, 0.9)",
                          fontSize: "0.9rem",
                        }}
                      >
                        <div className="mt-2 ms-4 d-flex flex-row gap-3 rounded">
                          {modal.index === items.id ? (
                            <>
                              <button onClick={() => UpdateTodo(items.id)}>
                                Save
                              </button>
                            </>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              className="bi bi-pencil-fill"
                              style={{
                                flexShrink: 0,
                                color: "rgba(60, 60, 60, 0.9)",
                                fontSize: "0.9rem",
                              }}
                              viewBox="0 0 16 16"
                              onClick={() => HandleClick(items.id, items.todo)}
                            >
                              <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z" />
                            </svg>
                          )}

                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="bi bi-trash3-fill"
                            onClick={() => HandleDelete(items.id)}
                            viewBox="0 0 16 16"
                            style={{
                              flexShrink: 0,
                              color: "rgba(60, 60, 60, 0.9)",
                            }}
                          >
                            <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
                          </svg>
                        </div>

                        <div className="mt-1 ms-3">
                          {items.date ? (
                            <>
                              <p className="mb-0">
                                {new Date(items.date).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </>
                          ) : (
                            <> 8:00 AM </>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                </>
              ))}

            {check.length > 0 ? (
              <>
                <div
                  className=""
                  style={{
                    // overflowX: "hidden",
                    justifyContent: "space-between",
                  }}
                >
                  <p
                    className="mb-1 text-center"
                    style={{ fontFamily: "cursive" }}
                  >
                    {" "}
                    Checked Items
                  </p>
                  {todo
                    .filter((item) => check.includes(item.id))
                    .map((items) => (
                      <>
                        <div className="d-flex flex-lg-row align-items-center ms-1">
                          <input
                            type="checkbox"
                            className="me-3 opacity-50"
                            checked={check.includes(items.id)}
                            onChange={() => HandleCheck(items.id)}
                            style={{
                              width: "20px",
                              height: "20px",
                              accentColor: "rgb(208, 171, 174)",
                              flexShrink: 0,
                            }}
                          />
                          <p
                            className={`py-2 mb-0 ${
                              check.includes(items.id)
                                ? "text-decoration-line-through opacity-50"
                                : ""
                            }`}
                            style={{
                              overflow: "hidden",
                              textAlign: "justify",
                              fontFamily: "cursive",
                            }}
                          >
                            {items.todo}
                          </p>
                        </div>
                      </>
                    ))}
                </div>
              </>
            ) : (
              <></>
            )}
          </ul>
        </div>
      </div>
    </>
  );
}

export default App;