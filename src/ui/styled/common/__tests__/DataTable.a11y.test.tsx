import { render, screen } from '@/tests/utils/testUtils'0;
import { DataTable } from '@/src/ui/styled/common/DataTable'60;

interface Row { id: number; name: string; }

const data = [{ id: 1, name: 'A' }];
const columns = [{ key: 'id', header: 'ID', sortable: true }, { key: 'name', header: 'Name' }];

describe('DataTable accessibility', () => {
  it('adds aria-sort on sortable headers', () => {
    render(<DataTable data={data} columns={columns} />);
    const header = screen.getByRole('columnheader', { name: 'ID' });
    expect(header).toHaveAttribute('aria-sort', 'none');
  });
});
