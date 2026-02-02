# 정산 로그 API 명세서

> 프론트엔드 정산 상태 변경 로그 화면을 위한 백엔드 API 설계 문서

---

## 1. API 개요

### 1-1. 정산 로그 조회 API

```
GET /api/v1/admin/settlements/logs
```

정산 상태 변경 이력을 조회합니다. 필터링, 정렬, 페이지네이션을 지원합니다.

---

## 2. Request

### 2-1. Query Parameters

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|:----:|--------|------|
| `page` | Integer | O | 0 | 페이지 번호 (0부터 시작) |
| `size` | Integer | O | 20 | 페이지당 로그 수 |
| `settlementId` | Long | X | - | 특정 정산 ID로 필터링 |
| `newStatus` | String | X | - | 변경된 상태로 필터링 |
| `actorType` | String | X | - | 실행자 타입으로 필터링 |
| `startDate` | String | X | - | 시작일 (YYYY-MM-DD) |
| `endDate` | String | X | - | 종료일 (YYYY-MM-DD) |
| `sortOrder` | String | X | DESC | 정렬 순서 (ASC, DESC) |

### 2-2. Enum 값

**SettlementStatus (정산 상태)**
| 값 | 설명 |
|----|------|
| `PENDING` | 대기중 |
| `IN_PROGRESS` | 진행중 |
| `HOLD` | 보류 |
| `COMPLETED` | 완료 |
| `FAILED` | 실패 |

**ActorType (실행자 타입)**
| 값 | 설명 |
|----|------|
| `SYSTEM` | 시스템 자동 처리 |
| `ADMIN` | 관리자 수동 처리 |
| `BATCH` | 배치 작업 |

### 2-3. 요청 예시

```bash
# 기본 조회
GET /api/v1/admin/settlements/logs?page=0&size=20

# 특정 정산 ID 조회
GET /api/v1/admin/settlements/logs?settlementId=1001

# 실패 상태만 조회
GET /api/v1/admin/settlements/logs?newStatus=FAILED

# 관리자가 변경한 로그만 조회
GET /api/v1/admin/settlements/logs?actorType=ADMIN

# 기간 필터 + 오래된순 정렬
GET /api/v1/admin/settlements/logs?startDate=2024-01-01&endDate=2024-01-31&sortOrder=ASC

# 복합 필터
GET /api/v1/admin/settlements/logs?newStatus=HOLD&actorType=ADMIN&startDate=2024-01-01&page=0&size=10
```

---

## 3. Response

### 3-1. 응답 구조

```json
{
  "content": [
    {
      "logId": 15,
      "settlementId": 1001,
      "previousStatus": "PENDING",
      "newStatus": "HOLD",
      "reason": "판매자 계좌 정보 확인 필요",
      "actorType": "ADMIN",
      "actorId": 1,
      "createdAt": "2024-01-15T14:30:00"
    },
    {
      "logId": 14,
      "settlementId": 1001,
      "previousStatus": null,
      "newStatus": "PENDING",
      "reason": "배치 정산 생성",
      "actorType": "BATCH",
      "actorId": null,
      "createdAt": "2024-01-14T09:00:00"
    }
  ],
  "totalElements": 150,
  "totalPages": 8,
  "size": 20,
  "number": 0
}
```

### 3-2. 응답 필드

**Page 정보**
| 필드 | 타입 | 설명 |
|------|------|------|
| `content` | Array | 로그 목록 |
| `totalElements` | Integer | 전체 로그 수 |
| `totalPages` | Integer | 전체 페이지 수 |
| `size` | Integer | 페이지당 크기 |
| `number` | Integer | 현재 페이지 번호 |

**SettlementLogDto**
| 필드 | 타입 | Nullable | 설명 |
|------|------|:--------:|------|
| `logId` | Long | X | 로그 ID |
| `settlementId` | Long | X | 정산 ID |
| `previousStatus` | String | O | 이전 상태 (신규 생성 시 null) |
| `newStatus` | String | X | 변경된 상태 |
| `reason` | String | O | 변경 사유 |
| `actorType` | String | X | 실행자 타입 |
| `actorId` | Long | O | 실행자 ID (BATCH인 경우 null) |
| `createdAt` | String | X | 생성 일시 (ISO 8601) |

---

## 4. 백엔드 구현 가이드

### 4-1. Entity

```java
@Entity
@Table(name = "settlement_logs")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SettlementLog extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long logId;

    @Column(nullable = false)
    private Long settlementId;

    @Enumerated(EnumType.STRING)
    private SettlementStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SettlementStatus newStatus;

    @Column(length = 500)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActorType actorType;

    private Long actorId;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Builder
    public SettlementLog(Long settlementId, SettlementStatus previousStatus,
                         SettlementStatus newStatus, String reason,
                         ActorType actorType, Long actorId) {
        this.settlementId = settlementId;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.reason = reason;
        this.actorType = actorType;
        this.actorId = actorId;
        this.createdAt = LocalDateTime.now();
    }
}
```

### 4-2. Filter DTO

```java
@Getter
@Builder
public class SettlementLogFilter {
    private Long settlementId;
    private SettlementStatus newStatus;
    private ActorType actorType;
    private LocalDate startDate;
    private LocalDate endDate;
    private SortOrder sortOrder;

    public enum SortOrder {
        ASC, DESC
    }
}
```

### 4-3. Repository + Specification

```java
public interface SettlementLogRepository extends JpaRepository<SettlementLog, Long>,
        JpaSpecificationExecutor<SettlementLog> {
}
```

```java
public class SettlementLogSpecification {

    public static Specification<SettlementLog> withFilter(SettlementLogFilter filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 정산 ID 필터
            if (filter.getSettlementId() != null) {
                predicates.add(
                    cb.equal(root.get("settlementId"), filter.getSettlementId())
                );
            }

            // 변경 상태 필터
            if (filter.getNewStatus() != null) {
                predicates.add(
                    cb.equal(root.get("newStatus"), filter.getNewStatus())
                );
            }

            // 실행자 타입 필터
            if (filter.getActorType() != null) {
                predicates.add(
                    cb.equal(root.get("actorType"), filter.getActorType())
                );
            }

            // 시작일 필터
            if (filter.getStartDate() != null) {
                predicates.add(
                    cb.greaterThanOrEqualTo(
                        root.get("createdAt"),
                        filter.getStartDate().atStartOfDay()
                    )
                );
            }

            // 종료일 필터 (해당 날짜 포함)
            if (filter.getEndDate() != null) {
                predicates.add(
                    cb.lessThan(
                        root.get("createdAt"),
                        filter.getEndDate().plusDays(1).atStartOfDay()
                    )
                );
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
```

### 4-4. Service

```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SettlementLogService {

    private final SettlementLogRepository logRepository;

    public Page<SettlementLogDto> getLogs(SettlementLogFilter filter, Pageable pageable) {
        // 정렬 적용
        Sort sort = filter.getSortOrder() == SortOrder.ASC
            ? Sort.by("createdAt").ascending()
            : Sort.by("createdAt").descending();

        Pageable sortedPageable = PageRequest.of(
            pageable.getPageNumber(),
            pageable.getPageSize(),
            sort
        );

        return logRepository
            .findAll(SettlementLogSpecification.withFilter(filter), sortedPageable)
            .map(SettlementLogDto::from);
    }

    @Transactional
    public void createLog(Long settlementId, SettlementStatus previousStatus,
                          SettlementStatus newStatus, String reason,
                          ActorType actorType, Long actorId) {
        SettlementLog log = SettlementLog.builder()
            .settlementId(settlementId)
            .previousStatus(previousStatus)
            .newStatus(newStatus)
            .reason(reason)
            .actorType(actorType)
            .actorId(actorId)
            .build();

        logRepository.save(log);
    }
}
```

### 4-5. Controller

```java
@RestController
@RequestMapping("/api/v1/admin/settlements")
@RequiredArgsConstructor
public class AdminSettlementLogController {

    private final SettlementLogService logService;

    @GetMapping("/logs")
    public ResponseEntity<Page<SettlementLogDto>> getLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long settlementId,
            @RequestParam(required = false) SettlementStatus newStatus,
            @RequestParam(required = false) ActorType actorType,
            @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "DESC") SortOrder sortOrder
    ) {
        SettlementLogFilter filter = SettlementLogFilter.builder()
            .settlementId(settlementId)
            .newStatus(newStatus)
            .actorType(actorType)
            .startDate(startDate)
            .endDate(endDate)
            .sortOrder(sortOrder)
            .build();

        Page<SettlementLogDto> result = logService.getLogs(
            filter,
            PageRequest.of(page, size)
        );

        return ResponseEntity.ok(result);
    }
}
```

### 4-6. Response DTO

```java
@Getter
@Builder
public class SettlementLogDto {
    private Long logId;
    private Long settlementId;
    private SettlementStatus previousStatus;
    private SettlementStatus newStatus;
    private String reason;
    private ActorType actorType;
    private Long actorId;
    private LocalDateTime createdAt;

    public static SettlementLogDto from(SettlementLog entity) {
        return SettlementLogDto.builder()
            .logId(entity.getLogId())
            .settlementId(entity.getSettlementId())
            .previousStatus(entity.getPreviousStatus())
            .newStatus(entity.getNewStatus())
            .reason(entity.getReason())
            .actorType(entity.getActorType())
            .actorId(entity.getActorId())
            .createdAt(entity.getCreatedAt())
            .build();
    }
}
```

---

## 5. 데이터베이스

### 5-1. 테이블 스키마

```sql
CREATE TABLE settlement_logs (
    log_id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    settlement_id   BIGINT NOT NULL,
    previous_status VARCHAR(20),
    new_status      VARCHAR(20) NOT NULL,
    reason          VARCHAR(500),
    actor_type      VARCHAR(20) NOT NULL,
    actor_id        BIGINT,
    created_at      DATETIME NOT NULL,

    CONSTRAINT fk_settlement_log_settlement
        FOREIGN KEY (settlement_id) REFERENCES settlements(settlement_id)
);
```

### 5-2. 인덱스

```sql
-- 기본 인덱스
CREATE INDEX idx_log_settlement_id ON settlement_logs(settlement_id);
CREATE INDEX idx_log_created_at ON settlement_logs(created_at DESC);
CREATE INDEX idx_log_new_status ON settlement_logs(new_status);
CREATE INDEX idx_log_actor_type ON settlement_logs(actor_type);

-- 복합 인덱스 (정산ID + 생성일 조합 조회가 많은 경우)
CREATE INDEX idx_log_settlement_created
    ON settlement_logs(settlement_id, created_at DESC);

-- 기간 검색 최적화
CREATE INDEX idx_log_created_at_range
    ON settlement_logs(created_at);
```

---

## 6. 확장: 정산별 그룹핑 API (선택)

프론트엔드에서 그룹핑하는 대신 백엔드에서 처리하는 API입니다.

### 6-1. Endpoint

```
GET /api/v1/admin/settlements/logs/grouped
```

### 6-2. Response

```json
{
  "content": [
    {
      "settlementId": 1001,
      "sellerName": "김판매자",
      "currentStatus": "HOLD",
      "logCount": 3,
      "lastUpdatedAt": "2024-01-15T14:30:00",
      "logs": [
        {
          "logId": 15,
          "previousStatus": "PENDING",
          "newStatus": "HOLD",
          "reason": "판매자 계좌 정보 확인 필요",
          "actorType": "ADMIN",
          "createdAt": "2024-01-15T14:30:00"
        },
        {
          "logId": 14,
          "previousStatus": null,
          "newStatus": "PENDING",
          "reason": "배치 정산 생성",
          "actorType": "BATCH",
          "createdAt": "2024-01-14T09:00:00"
        }
      ]
    }
  ],
  "totalElements": 50,
  "totalPages": 3,
  "size": 20,
  "number": 0
}
```

### 6-3. 구현 (Native Query 또는 QueryDSL)

```java
@Query(value = """
    SELECT s.settlement_id, s.seller_name, s.status as current_status,
           COUNT(l.log_id) as log_count,
           MAX(l.created_at) as last_updated_at
    FROM settlements s
    LEFT JOIN settlement_logs l ON s.settlement_id = l.settlement_id
    GROUP BY s.settlement_id
    ORDER BY last_updated_at DESC
    """, nativeQuery = true)
Page<Object[]> findGroupedLogs(Pageable pageable);
```

---

## 7. 에러 응답

### 7-1. 공통 에러 형식

```json
{
  "timestamp": "2024-01-15T14:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid status value: INVALID",
  "path": "/api/v1/admin/settlements/logs"
}
```

### 7-2. 에러 코드

| HTTP Status | 상황 |
|-------------|------|
| 400 | 잘못된 파라미터 값 |
| 401 | 인증 실패 |
| 403 | 관리자 권한 없음 |
| 500 | 서버 내부 오류 |

---

## 8. 보안

- 관리자 권한(`ROLE_ADMIN`) 필수
- `@PreAuthorize("hasRole('ADMIN')")` 적용
- 민감한 정보(actorId 등)는 권한에 따라 마스킹 고려

---

*문서 작성일: 2024-01-24*
