const router = require("express").Router();

const {addExpense,getRecentTransactions,getAllTransactions,deleteExpense,updateExpense} = require("../controllers/transactionController");

const {auth} = require("../middleware/authMiddleware");

router.post("/add-expense",auth, addExpense );

router.get("/recent-transactions",auth, getRecentTransactions);

router.get("/all-transactions",auth,getAllTransactions);

router.put("/update-expense/:transactionId",auth,updateExpense);

router.delete("/delete-expense/:transactionId",auth,deleteExpense);

module.exports = router;