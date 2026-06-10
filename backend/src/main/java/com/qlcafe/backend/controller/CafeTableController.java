package com.qlcafe.backend.controller;
import com.qlcafe.backend.entity.CafeTable;
import com.qlcafe.backend.service.CafeTableService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/tables")
public class CafeTableController {
    private final CafeTableService cafeTableService;
    public CafeTableController(CafeTableService cafeTableService) {
        this.cafeTableService = cafeTableService;
    }
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(cafeTableService.getAllTables());
    }
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    public ResponseEntity<?> create(@RequestBody CafeTable table) {
        return ResponseEntity.ok(cafeTableService.saveTable(table));
    }
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    public ResponseEntity<?> updateStatus(@PathVariable Integer id, @RequestParam String status) {
        return ResponseEntity.ok(cafeTableService.updateTableStatus(id, status));
    }
}
