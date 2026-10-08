from django.contrib.postgres.search import (SearchHeadline, SearchQuery, SearchRank, SearchVector)
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from notes.models import Note
from notes.access import visible_notes
from notes.models import Note
#SearchQuery-->User ले search गरेको कुरा PostgreSQL search query मा convert गर्छ।
#SearchVector-->Search कुन fields मा गर्ने?
#SearchRank-->यसले प्रत्येक result लाई relevance score दिन्छ।
#SearchHeadline-->यो search result को snippet/highlight बनाउन प्रयोग हुन्छ।

class SearchView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        q = request.query_params.get("q", "").strip()
        if not q:
            return Response({"detail": "Query parameter 'q' is required."}, status=400)

        query = SearchQuery(q, config="english")
        vector = SearchVector("title", "content", config="english")
        # isolation: only notes from workspaces this user belongs to
        qs = visible_notes(request.user)
        workspace_id = request.query_params.get("workspace")
        if workspace_id:
            qs = qs.filter(workspace_id=workspace_id)

        results = (qs.annotate(search=vector,rank=SearchRank(vector, query),snippet=SearchHeadline("content", query, config="english",start_sel="<b>", stop_sel="</b>")).filter(search=query).order_by("-rank")[:20])
        data = [
            {
                "id": n.id,
                "workspace": n.workspace_id,
                "title": n.title,
                "snippet": n.snippet,
                "rank": round(n.rank, 4),
            }
            for n in results
        ]
        return Response({"query": q, "count": len(data), "results": data})