package com.digitalfactory.platform.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.digitalfactory.platform.model.enums.ProjectStatus;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "projects")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ProjectStatus status = ProjectStatus.DRAFT;

    // A project has exactly one Supervisor
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supervisor_id", nullable = false)
    private User supervisor;

    // A project can have multiple Interns
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "project_interns",
            joinColumns = @JoinColumn(name = "project_id"),
            inverseJoinColumns = @JoinColumn(name = "intern_id")
    )
    @Builder.Default
    private Set<User> interns = new HashSet<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}