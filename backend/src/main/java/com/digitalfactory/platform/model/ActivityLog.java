package com.digitalfactory.platform.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "activity_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // e.g., "Mouad Abbassid"
    @Column(nullable = false)
    private String actorName; 

    // e.g., "updated task status to COMPLETED in"
    @Column(nullable = false)
    private String action; 

    // e.g., "Design Login Screen"
    @Column(nullable = false)
    private String target; 

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime timestamp;
}