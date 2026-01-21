export default function Handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json([]);
  }

  if (req.method === "POST") {
    try {
      const { newtodos } = req.body;
      if (!newtodos) {
        return res.status(400).json({ message: "Todo is required" });
      }

      return res.status(200).json({ newtodos });
    } catch (error) {
      return res.status(500).json({ message: "Failed to create todo" });
    }
  }

  if (req.method === "PUT") {
    try {
      const { id,updatedText } = req.body;
      if (id === undefined || updatedText === "") {
        return res.status(400).json({ message: "Invalid input" });
      }
      return res.status(200).json({
        id:id,
        updatedTodo: updatedText,
      });
    } catch (error) {
      return res.status(500).json({ message: "Failed to update todo" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ message: "ID is required" });
      }
      return res.status(200).json({ deleteId: Number(id) });
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete todo" });
    }
  }
  return res.status(405).json({ message: "Method not allowed" });
}