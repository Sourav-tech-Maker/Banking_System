using System;
using System.Collections.Generic;

namespace BankingSystem.Api.DTOs.Search
{
    public sealed record SearchResultDto(
        string Query,
        int TotalMatches,
        SearchCategoriesDto Results
    );

    public sealed record SearchCategoriesDto(
        List<SearchItemDto> Pages,
        List<SearchItemDto> Transactions,
        List<SearchItemDto> Beneficiaries,
        List<SearchItemDto> Goals
    );

    public sealed record SearchItemDto(
        string Id,
        string Category,
        string Title,
        string Subtitle,
        string BadgeText,
        string Value,
        string ActionViewId,
        string IconType
    );
}
