<?php

class LoanController {

    public function getLoanByPhone($phone)
    {
        global $conn;

        $stmt = $conn->prepare("
            SELECT l.phone, la.reference_id, la.status, 
                   la.offer_amount, la.lender_name, 
                   la.interest_rate, la.updated_at
            FROM loan_applications la
            JOIN leads l ON la.lead_id = l.id
            WHERE l.phone = ?
            ORDER BY la.id DESC LIMIT 1
        ");

        $stmt->bind_param("s", $phone);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

}