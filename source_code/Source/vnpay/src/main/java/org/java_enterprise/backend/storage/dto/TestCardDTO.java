package org.java_enterprise.backend.storage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestCardDTO {
    private int id;
    private String cardType;         // "Nội địa", "VISA", "MasterCard", "JCB"
    private String issuer;           // NCB, EXIMBANK, etc.
    private String cardNumber;
    private String cardHolder;
    private String issueDate;        // For nội địa (MM/yy or MM/yyyy)
    private String expiryDate;       // For quốc tế (MM/yy or MM/yyyy)
    private String cvv;              // Only for quốc tế
    private String otp;              // Only for nội địa
    private String email;            // Optional
    private String address;          // Optional
    private String city;             // Optional

    public static List<TestCardDTO> testCardList(){
        List<TestCardDTO> testCards = List.of(
                new TestCardDTO(1, "ATM nội địa", "NCB", "9704198526191432198", "NGUYEN VAN A", "07/15", null, null, "123456", null, null, null),
                new TestCardDTO(2, "ATM nội địa", "NCB", "9704195798459170488", "NGUYEN VAN A", "07/15", null, null, null, null, null, null),
                new TestCardDTO(3, "ATM nội địa", "NCB", "9704192181368742", "NGUYEN VAN A", "07/15", null, null, null, null, null, null),
                new TestCardDTO(4, "ATM nội địa", "NCB", "9704193370791314", "NGUYEN VAN A", "07/15", null, null, null, null, null, null),
                new TestCardDTO(5, "ATM nội địa", "NCB", "9704194841945513", "NGUYEN VAN A", "07/15", null, null, null, null, null, null),
                new TestCardDTO(6, "VISA (No 3DS)", "VISA", "4456530000001005", "NGUYEN VAN A", null, "12/26", "123", null, "test@gmail.com", "22 Lang Ha", "Ha Noi"),
                new TestCardDTO(7, "VISA (3DS)", "VISA", "4456530000001096", "NGUYEN VAN A", null, "12/26", "123", null, "test@gmail.com", "22 Lang Ha", "Ha Noi"),
                new TestCardDTO(8, "MasterCard (No 3DS)", "MasterCard", "5200000000001005", "NGUYEN VAN A", null, "12/26", "123", null, "test@gmail.com", "22 Lang Ha", "Ha Noi"),
                new TestCardDTO(9, "MasterCard (3DS)", "MasterCard", "5200000000001096", "NGUYEN VAN A", null, "12/26", "123", null, "test@gmail.com", "22 Lang Ha", "Ha Noi"),
                new TestCardDTO(10, "JCB (No 3DS)", "JCB", "3337000000000008", "NGUYEN VAN A", null, "12/26", "123", null, "test@gmail.com", "22 Lang Ha", "Ha Noi"),
                new TestCardDTO(11, "JCB (3DS)", "JCB", "3337000000200004", "NGUYEN VAN A", null, "12/24", "123", null, "test@gmail.com", "22 Lang Ha", "Ha Noi"),
                new TestCardDTO(12, "ATM nội địa", "NAPAS", "9704000000000018", "NGUYEN VAN A", "03/07", null, null, "otp", null, null, null),
                new TestCardDTO(13, "ATM nội địa", "NAPAS", "9704020000000016", "NGUYEN VAN A", "03/07", null, null, "otp", null, null, null),
                new TestCardDTO(14, "ATM nội địa", "EXIMBANK", "9704310005819191", "NGUYEN VAN A", null, "10/26", null, null, null, null, null)
        );
        return testCards;
    }
}
